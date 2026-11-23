import json
import csv
import io
from datetime import datetime

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q, Avg, Count, Max, Min
from django.shortcuts import get_object_or_404
from django.core.cache import cache
from django.db import transaction

from .models import Student, Subject, ExamResult, Attendance


def safe_float(val, default=0.0):
    try:
        if val is None or str(val).strip() == '':
            return default
        return float(str(val).strip())
    except (ValueError, TypeError):
        return default


def safe_int(val, default=0):
    try:
        if val is None or str(val).strip() == '':
            return default
        return int(float(str(val).strip()))
    except (ValueError, TypeError):
        return default


def json_response(data, status=200):
    return JsonResponse(data, status=status, safe=False)


def calc_grade(score):
    if score >= 95: return 'A+'
    elif score >= 90: return 'A'
    elif score >= 85: return 'A-'
    elif score >= 80: return 'B+'
    elif score >= 75: return 'B'
    elif score >= 70: return 'B-'
    elif score >= 65: return 'C+'
    elif score >= 60: return 'C'
    elif score >= 55: return 'C-'
    elif score >= 50: return 'D'
    return 'F'


# ─── Dashboard API ───────────────────────────────────────────────────────────

def api_dashboard_data(request):
    cached = cache.get('dashboard_summary')
    if cached:
        return json_response(cached)

    total_students = Student.objects.filter(is_active=True).count()
    total_subjects = Subject.objects.count()
    total_results  = ExamResult.objects.count()
    classes        = list(Student.objects.filter(is_active=True).values_list('class_name', flat=True).distinct())

    stats = ExamResult.objects.aggregate(
        avg=Avg('marks_obtained'),
        pass_cnt=Count('id', filter=Q(marks_obtained__gte=50)),
        fail_cnt=Count('id', filter=Q(marks_obtained__lt=50))
    )
    avg_score  = round(stats['avg'] or 0, 2)
    pass_count = stats['pass_cnt'] or 0
    fail_count = stats['fail_cnt'] or 0

    top_students_qs = Student.objects.filter(is_active=True).annotate(
        computed_avg=Avg('results__marks_obtained')
    ).filter(computed_avg__isnull=False).order_by('-computed_avg')[:10]

    top_students = [{
        'id': s.id,
        'student_id': s.student_id,
        'full_name': s.full_name(),
        'class_name': s.class_name,
        'average_score': round(s.computed_avg, 2),
        'grade': calc_grade(s.computed_avg),
    } for s in top_students_qs[:5]]

    recent_results_qs = ExamResult.objects.select_related('student', 'subject').order_by('-created_at')[:10]
    recent_results = [{
        'id': r.id,
        'student_id': r.student.student_id,
        'student_name': r.student.full_name(),
        'student_pk': r.student.id,
        'subject_name': r.subject.name,
        'subject_code': r.subject.code,
        'exam_type': r.exam_type,
        'marks_obtained': r.marks_obtained,
        'max_marks': r.max_marks,
        'percentage': r.percentage,
        'grade': r.grade,
        'exam_date': r.exam_date.strftime('%Y-%m-%d') if r.exam_date else '',
    } for r in recent_results_qs]

    # Pre-aggregate all 4 dashboard charts in one go
    grade_order = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F']
    counts_map = dict(ExamResult.objects.values_list('grade').annotate(cnt=Count('id')))
    grade_chart = {'labels': grade_order, 'data': [counts_map.get(g, 0) for g in grade_order]}

    subj_qs = Subject.objects.annotate(
        computed_avg=Avg('results__marks_obtained')
    ).filter(computed_avg__isnull=False).order_by('name')
    subject_chart = {
        'labels': [s.name for s in subj_qs],
        'data': [round(s.computed_avg, 2) for s in subj_qs]
    }

    top_chart = {
        'labels': [s.full_name() for s in top_students_qs],
        'data': [round(s.computed_avg, 2) for s in top_students_qs]
    }

    exam_order = ['Unit Test 1', 'Unit Test 2', 'Mid Term', 'Pre Final', 'Final']
    trend_map = dict(
        ExamResult.objects.values('exam_type').annotate(
            computed_avg=Avg('marks_obtained')
        ).values_list('exam_type', 'computed_avg')
    )
    trend_labels = [et for et in exam_order if et in trend_map and trend_map[et] is not None]
    exam_trend_chart = {
        'labels': trend_labels,
        'data': [round(trend_map[et], 2) for et in trend_labels]
    }

    result = {
        'total_students': total_students,
        'total_subjects': total_subjects,
        'total_results':  total_results,
        'avg_score':      avg_score,
        'pass_count':     pass_count,
        'fail_count':     fail_count,
        'classes':        classes,
        'top_students':   top_students,
        'recent_results': recent_results,
        'charts': {
            'grade_dist': grade_chart,
            'subject_avg': subject_chart,
            'top_students': top_chart,
            'exam_trend': exam_trend_chart,
        }
    }
    cache.set('dashboard_summary', result, 60)
    return json_response(result)


# ─── Students APIs ───────────────────────────────────────────────────────────

@csrf_exempt
def api_students(request):
    if request.method == 'GET':
        query      = request.GET.get('q', '').strip()
        class_name = request.GET.get('class_name', '').strip()
        gender     = request.GET.get('gender', '').strip()

        students = Student.objects.filter(is_active=True)
        if query:
            students = students.filter(
                Q(first_name__icontains=query) |
                Q(last_name__icontains=query)  |
                Q(student_id__icontains=query) |
                Q(email__icontains=query)
            )
        if class_name:
            students = students.filter(class_name=class_name)
        if gender:
            students = students.filter(gender=gender)

        data = []
        for s in students:
            data.append({
                'id':           s.id,
                'student_id':   s.student_id,
                'first_name':   s.first_name,
                'last_name':    s.last_name,
                'full_name':    s.full_name(),
                'email':        s.email,
                'gender':       s.gender,
                'class_name':   s.class_name,
                'section':      s.section,
                'roll_number':  s.roll_number,
                'average_score':s.average_score(),
                'grade':        s.overall_grade(),
                'results_count':s.results.count(),
                'photo_url':    s.photo.url if s.photo else None,
            })
        classes = list(Student.objects.filter(is_active=True).values_list('class_name', flat=True).distinct())
        return json_response({'students': data, 'classes': classes, 'total': len(data)})

    elif request.method == 'POST':
        try:
            body = json.loads(request.body.decode('utf-8'))
        except Exception:
            body = request.POST

        student = Student.objects.create(
            student_id   = body.get('student_id', '').strip(),
            first_name   = body.get('first_name', '').strip(),
            last_name    = body.get('last_name', '').strip(),
            email        = body.get('email', '').strip(),
            gender       = body.get('gender', 'Other').strip() or 'Other',
            date_of_birth= body.get('date_of_birth') or None,
            class_name   = body.get('class_name', '').strip(),
            section      = body.get('section', '').strip(),
            roll_number  = int(body.get('roll_number', 0) or 0) if body.get('roll_number') else None,
            parent_name  = body.get('parent_name', '').strip(),
            contact      = body.get('contact', '').strip(),
            address      = body.get('address', '').strip(),
        )
        return json_response({'success': True, 'student': {'id': student.id, 'student_id': student.student_id, 'full_name': student.full_name()}}, status=201)

    return json_response({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def api_student_detail(request, pk):
    student = get_object_or_404(Student, pk=pk)

    if request.method == 'GET':
        results = ExamResult.objects.filter(student=student).select_related('subject').order_by('-exam_date')
        subjects = Subject.objects.filter(class_name=student.class_name)

        subject_avgs = {}
        for subj in subjects:
            subj_results = results.filter(subject=subj)
            if subj_results.exists():
                subject_avgs[subj.name] = round(sum(r.percentage for r in subj_results) / subj_results.count(), 2)

        exam_type_data = {}
        for et, _ in ExamResult.EXAM_TYPES:
            et_results = results.filter(exam_type=et)
            if et_results.exists():
                exam_type_data[et] = round(sum(r.percentage for r in et_results) / et_results.count(), 2)

        attendance_pct = 0
        att_records = Attendance.objects.filter(student=student)
        if att_records.exists():
            present = att_records.filter(is_present=True).count()
            attendance_pct = round((present / att_records.count()) * 100, 2)

        results_list = [{
            'id':             r.id,
            'subject_name':   r.subject.name,
            'subject_code':   r.subject.code,
            'exam_type':      r.exam_type,
            'marks_obtained': r.marks_obtained,
            'max_marks':      r.max_marks,
            'percentage':     r.percentage,
            'grade':          r.grade,
            'exam_date':      r.exam_date.strftime('%Y-%m-%d') if r.exam_date else '',
        } for r in results]

        return json_response({
            'student': {
                'id':           student.id,
                'student_id':   student.student_id,
                'first_name':   student.first_name,
                'last_name':    student.last_name,
                'full_name':    student.full_name(),
                'email':        student.email,
                'gender':       student.gender,
                'date_of_birth':student.date_of_birth.strftime('%Y-%m-%d') if student.date_of_birth else '',
                'class_name':   student.class_name,
                'section':      student.section,
                'roll_number':  student.roll_number,
                'parent_name':  student.parent_name,
                'contact':      student.contact,
                'address':      student.address,
                'average_score':student.average_score(),
                'grade':        student.overall_grade(),
                'rank':         student.rank_in_class(),
                'attendance_pct': attendance_pct,
                'photo_url':    student.photo.url if student.photo else None,
            },
            'subject_avgs':   subject_avgs,
            'exam_type_data': exam_type_data,
            'results':        results_list,
        })

    elif request.method in ('PUT', 'PATCH'):
        try:
            body = json.loads(request.body.decode('utf-8'))
        except Exception:
            body = request.POST

        for field in ['first_name', 'last_name', 'email', 'gender', 'class_name', 'section', 'parent_name', 'contact', 'address']:
            if field in body:
                setattr(student, field, body[field])
        if 'roll_number' in body:
            student.roll_number = int(body['roll_number']) if body['roll_number'] else None
        if 'date_of_birth' in body and body['date_of_birth']:
            student.date_of_birth = body['date_of_birth']
        student.save()
        return json_response({'success': True, 'message': 'Student updated successfully'})

    elif request.method == 'DELETE':
        student.is_active = False
        student.save()
        return json_response({'success': True, 'message': 'Student removed'})

    return json_response({'error': 'Method not allowed'}, status=405)


# ─── Subjects APIs ───────────────────────────────────────────────────────────

@csrf_exempt
def api_subjects(request):
    if request.method == 'GET':
        subjects = Subject.objects.all().order_by('name')
        data = [{
            'id':           s.id,
            'name':         s.name,
            'code':         s.code,
            'max_marks':    s.max_marks,
            'class_name':   s.class_name,
            'teacher':      s.teacher,
            'results_count':s.results.count(),
        } for s in subjects]
        return json_response({'subjects': data, 'total': len(data)})

    elif request.method == 'POST':
        try:
            body = json.loads(request.body.decode('utf-8'))
        except Exception:
            body = request.POST

        subject = Subject.objects.create(
            name       = body.get('name', '').strip(),
            code       = body.get('code', '').strip().upper(),
            max_marks  = int(body.get('max_marks', 100) or 100),
            class_name = body.get('class_name', '').strip(),
            teacher    = body.get('teacher', '').strip(),
        )
        return json_response({'success': True, 'subject': {'id': subject.id, 'name': subject.name, 'code': subject.code}}, status=201)

    return json_response({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def api_subject_detail(request, pk):
    subject = get_object_or_404(Subject, pk=pk)
    if request.method == 'DELETE':
        subject.delete()
        return json_response({'success': True, 'message': 'Subject deleted'})
    return json_response({'error': 'Method not allowed'}, status=405)


# ─── Results APIs ────────────────────────────────────────────────────────────

@csrf_exempt
def api_results(request):
    if request.method == 'GET':
        class_name = request.GET.get('class_name', '').strip()
        exam_type  = request.GET.get('exam_type', '').strip()
        subject_id = request.GET.get('subject', '').strip()

        results = ExamResult.objects.select_related('student', 'subject').order_by('-exam_date')
        if class_name:
            results = results.filter(student__class_name=class_name)
        if exam_type:
            results = results.filter(exam_type=exam_type)
        if subject_id:
            results = results.filter(subject_id=subject_id)

        data = [{
            'id':             r.id,
            'student_id':     r.student.student_id,
            'student_name':   r.student.full_name(),
            'student_pk':     r.student.id,
            'class_name':     r.student.class_name,
            'subject_name':   r.subject.name,
            'subject_id':     r.subject.id,
            'exam_type':      r.exam_type,
            'marks_obtained': r.marks_obtained,
            'max_marks':      r.max_marks,
            'percentage':     r.percentage,
            'grade':          r.grade,
            'exam_date':      r.exam_date.strftime('%Y-%m-%d') if r.exam_date else '',
        } for r in results]

        classes = list(Student.objects.filter(is_active=True).values_list('class_name', flat=True).distinct())
        subjects = [{'id': s.id, 'name': s.name, 'code': s.code} for s in Subject.objects.all()]
        exam_types = [t[0] for t in ExamResult.EXAM_TYPES]

        return json_response({
            'results': data,
            'classes': classes,
            'subjects': subjects,
            'exam_types': exam_types,
            'total': len(data),
        })

    elif request.method == 'POST':
        try:
            body = json.loads(request.body.decode('utf-8'))
        except Exception:
            body = request.POST

        student = get_object_or_404(Student, pk=body.get('student'))
        subject = get_object_or_404(Subject, pk=body.get('subject'))
        exam_type = body.get('exam_type', '').strip()
        exam_date = body.get('exam_date') or datetime.now().date()
        marks     = float(body.get('marks_obtained', 0))
        max_marks = float(body.get('max_marks', 100))

        result = ExamResult.objects.create(
            student=student,
            subject=subject,
            exam_type=exam_type,
            exam_date=exam_date,
            marks_obtained=marks,
            max_marks=max_marks,
            remarks=body.get('remarks', ''),
        )
        return json_response({
            'success': True,
            'result': {
                'id': result.id,
                'grade': result.grade,
                'percentage': result.percentage,
            }
        }, status=201)

    return json_response({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def api_result_detail(request, pk):
    result = get_object_or_404(ExamResult, pk=pk)
    if request.method == 'DELETE':
        result.delete()
        return json_response({'success': True, 'message': 'Result deleted'})
    return json_response({'error': 'Method not allowed'}, status=405)


# ─── Analysis APIs ───────────────────────────────────────────────────────────

def api_analysis(request):
    classes = list(Student.objects.filter(is_active=True).values_list('class_name', flat=True).distinct())

    subj_stats_qs = Subject.objects.annotate(
        avg_score=Avg('results__marks_obtained'),
        max_score=Max('results__marks_obtained'),
        min_score=Min('results__marks_obtained'),
        total_cnt=Count('results__id'),
        pass_cnt=Count('results__id', filter=Q(results__marks_obtained__gte=50)),
    ).filter(total_cnt__gt=0).order_by('name')

    subject_stats = []
    for s in subj_stats_qs:
        avg = round(s.avg_score or 0, 2)
        pass_pct = round((s.pass_cnt / s.total_cnt * 100), 2) if s.total_cnt else 0
        perf = 'Excellent' if avg >= 75 else 'Good' if avg >= 60 else 'Average' if avg >= 50 else 'Needs Attention'
        subject_stats.append({
            'subject':     s.name,
            'code':        s.code,
            'avg':         avg,
            'max':         round(s.max_score or 0, 2),
            'min':         round(s.min_score or 0, 2),
            'pass_pct':    pass_pct,
            'performance': perf,
        })

    class_stats_qs = Student.objects.filter(is_active=True).values('class_name').annotate(
        avg_score=Avg('results__marks_obtained'),
        student_count=Count('id', distinct=True),
    ).filter(avg_score__isnull=False).order_by('class_name')

    class_stats = []
    for c in class_stats_qs:
        avg = round(c['avg_score'] or 0, 2)
        perf = 'Excellent' if avg >= 75 else 'Good' if avg >= 60 else 'Average' if avg >= 50 else 'Needs Improvement'
        class_stats.append({
            'class':       c['class_name'],
            'avg':         avg,
            'count':       c['student_count'],
            'performance': perf,
        })

    return json_response({
        'subject_stats': subject_stats,
        'class_stats':   class_stats,
        'classes':       classes,
    })


def api_class_rankings(request):
    class_name = request.GET.get('class_name', '').strip()
    students_qs = Student.objects.filter(is_active=True)
    if class_name:
        students_qs = students_qs.filter(class_name=class_name)

    classes = list(Student.objects.filter(is_active=True).values_list('class_name', flat=True).distinct())

    students_annotated = students_qs.annotate(
        computed_avg=Avg('results__marks_obtained')
    ).filter(computed_avg__isnull=False).order_by('-computed_avg')

    student_data = []
    for s in students_annotated:
        avg = round(s.computed_avg or 0, 2)
        perf = 'Excellent' if avg >= 75 else 'Good' if avg >= 60 else 'Pass' if avg >= 50 else 'Fail'
        student_data.append({
            'pk':          s.pk,
            'id':          s.student_id,
            'name':        s.full_name(),
            'class_name':  s.class_name,
            'avg':         avg,
            'grade':       calc_grade(avg),
            'performance': perf,
        })

    return json_response({
        'rankings':       student_data,
        'classes':        classes,
        'selected_class': class_name,
    })


# ─── Bulk Upload API ─────────────────────────────────────────────────────────

@csrf_exempt
def api_upload_data(request):
    if request.method != 'POST':
        return json_response({'error': 'POST method required'}, status=405)

    upload_type = request.POST.get('upload_type', '').strip().lower()
    uploaded_file = request.FILES.get('csv_file')

    if not uploaded_file:
        return json_response({'error': 'Please select a CSV or Excel file to upload.'}, status=400)

    try:
        filename = uploaded_file.name.lower()
        rows = []
        if filename.endswith(('.xlsx', '.xls')):
            import pandas as pd
            df = pd.read_excel(uploaded_file)
            df = df.fillna('')
            rows = df.to_dict(orient='records')
        else:
            raw_bytes = uploaded_file.read()
            decoded = None
            for enc in ('utf-8-sig', 'utf-8', 'latin-1'):
                try:
                    decoded = raw_bytes.decode(enc)
                    break
                except UnicodeDecodeError:
                    continue
            if decoded is None:
                decoded = raw_bytes.decode('utf-8', errors='ignore')
            reader = csv.DictReader(io.StringIO(decoded))
            rows = list(reader)

        if not rows:
            return json_response({'error': 'The uploaded file is empty or contains no data rows.'}, status=400)

        # Inspect headers (case-insensitive)
        sample_row = rows[0]
        header_keys = {str(k).lower().strip(): k for k in sample_row.keys() if k is not None}

        # Auto-detect upload type if mismatched
        has_subject_code = 'code' in header_keys and 'name' in header_keys and 'student_id' not in header_keys
        has_marks = 'marks_obtained' in header_keys or 'subject_code' in header_keys
        has_student = 'student_id' in header_keys and ('first_name' in header_keys or 'last_name' in header_keys or not has_marks)

        if has_subject_code and upload_type != 'subjects':
            upload_type = 'subjects'
        elif has_marks and upload_type != 'results':
            upload_type = 'results'
        elif has_student and upload_type != 'students':
            upload_type = 'students'

        count = 0
        with transaction.atomic():
            if upload_type == 'students':
                for idx, row in enumerate(rows, 1):
                    norm_row = {str(k).lower().strip(): v for k, v in row.items() if k is not None}
                    sid = str(norm_row.get('student_id', '')).strip()
                    if not sid:
                        continue

                    email = str(norm_row.get('email', '')).strip()
                    if not email:
                        email = f"{sid.lower()}@school.edu"
                    elif Student.objects.filter(email=email).exclude(student_id=sid).exists():
                        email = f"{sid.lower()}.{email}"

                    Student.objects.update_or_create(
                        student_id=sid,
                        defaults={
                            'first_name':  str(norm_row.get('first_name', '')).strip() or sid,
                            'last_name':   str(norm_row.get('last_name', '')).strip() or 'Student',
                            'email':       email,
                            'gender':      str(norm_row.get('gender', 'Other')).strip() or 'Other',
                            'class_name':  str(norm_row.get('class_name', '10A')).strip() or '10A',
                            'section':     str(norm_row.get('section', 'A')).strip() or 'A',
                            'roll_number': safe_int(norm_row.get('roll_number'), idx),
                            'parent_name': str(norm_row.get('parent_name', '')).strip(),
                            'contact':     str(norm_row.get('contact', '')).strip(),
                        }
                    )
                    count += 1

            elif upload_type == 'results':
                for row in rows:
                    norm_row = {str(k).lower().strip(): v for k, v in row.items() if k is not None}
                    sid  = str(norm_row.get('student_id', '')).strip()
                    code = str(norm_row.get('subject_code', '')).strip() or str(norm_row.get('code', '')).strip()
                    if not sid or not code:
                        continue

                    student = Student.objects.filter(student_id=sid).first()
                    if not student:
                        student = Student.objects.create(
                            student_id=sid,
                            first_name=sid,
                            last_name='Student',
                            email=f"{sid.lower()}@school.edu",
                            class_name='10A',
                            gender='Other'
                        )

                    subject = Subject.objects.filter(code=code).first()
                    if not subject:
                        subject = Subject.objects.create(
                            code=code,
                            name=code,
                            class_name=student.class_name or '10A',
                            max_marks=safe_int(norm_row.get('max_marks', 100), 100)
                        )

                    exam_type = str(norm_row.get('exam_type', 'Final')).strip() or 'Final'
                    exam_date = str(norm_row.get('exam_date', '2024-01-01')).strip()
                    if ' ' in exam_date:
                        exam_date = exam_date.split(' ')[0]
                    if 'T' in exam_date:
                        exam_date = exam_date.split('T')[0]
                    if not exam_date:
                        exam_date = '2024-01-01'

                    ExamResult.objects.update_or_create(
                        student=student,
                        subject=subject,
                        exam_type=exam_type,
                        defaults={
                            'exam_date':      exam_date,
                            'marks_obtained': safe_float(norm_row.get('marks_obtained', 0)),
                            'max_marks':      safe_float(norm_row.get('max_marks', 100), 100.0),
                        }
                    )
                    count += 1

            elif upload_type == 'subjects':
                for row in rows:
                    norm_row = {str(k).lower().strip(): v for k, v in row.items() if k is not None}
                    code = str(norm_row.get('code', '')).strip() or str(norm_row.get('subject_code', '')).strip()
                    if not code:
                        continue
                    Subject.objects.update_or_create(
                        code=code,
                        defaults={
                            'name':       str(norm_row.get('name', '')).strip() or code,
                            'max_marks':  safe_int(norm_row.get('max_marks', 100), 100),
                            'class_name': str(norm_row.get('class_name', '10A')).strip() or '10A',
                            'teacher':    str(norm_row.get('teacher', '')).strip(),
                        }
                    )
                    count += 1

        # Invalidate dashboard cache
        cache.delete('dashboard_summary')

        type_label = 'Subjects' if upload_type == 'subjects' else 'Results' if upload_type == 'results' else 'Students'
        return json_response({'success': True, 'count': count, 'message': f'Successfully imported {count} {type_label} records.'})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return json_response({'error': f'Error importing data: {str(e)}'}, status=400)


# ─── Chart APIs ──────────────────────────────────────────────────────────────

def api_grade_dist(request):
    grade_order = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F']
    counts_map = dict(ExamResult.objects.values_list('grade').annotate(cnt=Count('id')))
    return json_response({'labels': grade_order, 'data': [counts_map.get(g, 0) for g in grade_order]})


def api_subject_avg(request):
    subjects = Subject.objects.annotate(
        computed_avg=Avg('results__marks_obtained')
    ).filter(computed_avg__isnull=False).order_by('name')
    labels = [s.name for s in subjects]
    avgs = [round(s.computed_avg, 2) for s in subjects]
    return json_response({'labels': labels, 'data': avgs})


def api_class_performance(request):
    class_perf = Student.objects.filter(is_active=True).values('class_name').annotate(
        computed_avg=Avg('results__marks_obtained')
    ).filter(computed_avg__isnull=False).order_by('class_name')
    labels = [c['class_name'] for c in class_perf]
    avgs = [round(c['computed_avg'], 2) for c in class_perf]
    return json_response({'labels': labels, 'data': avgs})


def api_student_chart(request, pk):
    student = get_object_or_404(Student, pk=pk)
    results = ExamResult.objects.filter(student=student).values('subject__name').annotate(
        computed_avg=Avg('marks_obtained')
    ).order_by('subject__name')
    labels = [r['subject__name'] for r in results]
    avgs = [round(r['computed_avg'], 2) for r in results]
    return json_response({'labels': labels, 'data': avgs})


def api_top_students(request):
    top = Student.objects.filter(is_active=True).annotate(
        computed_avg=Avg('results__marks_obtained')
    ).filter(computed_avg__isnull=False).order_by('-computed_avg')[:10]
    labels = [s.full_name() for s in top]
    data = [round(s.computed_avg, 2) for s in top]
    return json_response({'labels': labels, 'data': data})


def api_exam_trend(request):
    exam_order = ['Unit Test 1', 'Unit Test 2', 'Mid Term', 'Pre Final', 'Final']
    trend_map = dict(
        ExamResult.objects.values('exam_type').annotate(
            computed_avg=Avg('marks_obtained')
        ).values_list('exam_type', 'computed_avg')
    )
    labels = [et for et in exam_order if et in trend_map and trend_map[et] is not None]
    avgs = [round(trend_map[et], 2) for et in labels]
    return json_response({'labels': labels, 'data': avgs})
