from datetime import date
from django.test import TestCase, Client
from django.urls import reverse
from students.models import Student, Subject, ExamResult, Attendance


class StudentModelTest(TestCase):
    def setUp(self):
        self.student = Student.objects.create(
            student_id='STU001',
            first_name='John',
            last_name='Doe',
            email='john.doe@example.com',
            gender='Male',
            class_name='10A',
            section='A',
            roll_number=1,
        )
        self.subject = Subject.objects.create(
            name='Mathematics',
            code='MATH10',
            max_marks=100,
            class_name='10A',
            teacher='Mr. Smith',
        )

    def test_student_str_and_full_name(self):
        self.assertEqual(str(self.student), 'John Doe (STU001)')
        self.assertEqual(self.student.full_name(), 'John Doe')

    def test_subject_str(self):
        self.assertEqual(str(self.subject), 'Mathematics (MATH10)')

    def test_exam_result_grade_calculation(self):
        result = ExamResult.objects.create(
            student=self.student,
            subject=self.subject,
            exam_type='Final',
            exam_date=date(2024, 3, 15),
            marks_obtained=95,
            max_marks=100,
        )
        self.assertEqual(result.grade, 'A+')
        self.assertEqual(result.percentage, 95.0)

        # Student average and grade
        self.assertEqual(self.student.average_score(), 95.0)
        self.assertEqual(self.student.overall_grade(), 'A+')

    def test_grade_boundaries(self):
        grades = [
            (96, 'A+'),
            (91, 'A'),
            (86, 'A-'),
            (81, 'B+'),
            (76, 'B'),
            (71, 'B-'),
            (66, 'C+'),
            (61, 'C'),
            (56, 'C-'),
            (51, 'D'),
            (45, 'F'),
        ]
        sub = Subject.objects.create(name='Physics', code='PHY10', max_marks=100, class_name='10A')
        for i, (score, expected_grade) in enumerate(grades):
            res = ExamResult.objects.create(
                student=self.student,
                subject=sub,
                exam_type=f'Quiz_{i}',
                exam_date=date(2024, 1, 1),
                marks_obtained=score,
                max_marks=100,
            )
            self.assertEqual(res.grade, expected_grade, f"Score {score} expected {expected_grade} but got {res.grade}")


class RestApiTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.student = Student.objects.create(
            student_id='STU002',
            first_name='Jane',
            last_name='Smith',
            email='jane.smith@example.com',
            gender='Female',
            class_name='10A',
            section='A',
            roll_number=2,
        )
        self.subject = Subject.objects.create(
            name='Science',
            code='SCI10',
            max_marks=100,
            class_name='10A',
        )

    def test_dashboard_api(self):
        res = self.client.get(reverse('api_dashboard_data'))
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn('total_students', data)
        self.assertIn('total_subjects', data)
        self.assertIn('pass_count', data)

    def test_students_crud_api(self):
        # List
        res = self.client.get(reverse('api_students_list_create'))
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(len(res.json()['students']), 1)

        # Create
        new_student_data = {
            'student_id': 'STU999',
            'first_name': 'Alice',
            'last_name': 'Wonder',
            'email': 'alice@example.com',
            'class_name': '10A',
            'gender': 'Female',
        }
        create_res = self.client.post(
            reverse('api_students_list_create'),
            data=new_student_data,
            content_type='application/json'
        )
        self.assertEqual(create_res.status_code, 201)
        created_id = create_res.json()['student']['id']

        # Detail & Update
        detail_res = self.client.get(reverse('api_student_detail', kwargs={'pk': created_id}))
        self.assertEqual(detail_res.status_code, 200)
        self.assertEqual(detail_res.json()['student']['first_name'], 'Alice')

        update_res = self.client.patch(
            reverse('api_student_detail', kwargs={'pk': created_id}),
            data={'first_name': 'Alicia'},
            content_type='application/json'
        )
        self.assertEqual(update_res.status_code, 200)

        # Delete
        delete_res = self.client.delete(reverse('api_student_detail', kwargs={'pk': created_id}))
        self.assertEqual(delete_res.status_code, 200)

    def test_subjects_crud_api(self):
        # List
        res = self.client.get(reverse('api_subjects_list_create'))
        self.assertEqual(res.status_code, 200)

        # Create
        create_res = self.client.post(
            reverse('api_subjects_list_create'),
            data={'code': 'HIST10', 'name': 'History', 'class_name': '10A', 'max_marks': 100},
            content_type='application/json'
        )
        self.assertEqual(create_res.status_code, 201)
        sub_id = create_res.json()['subject']['id']

        # Delete
        delete_res = self.client.delete(reverse('api_subject_detail', kwargs={'pk': sub_id}))
        self.assertEqual(delete_res.status_code, 200)

    def test_results_crud_api(self):
        # Create result
        res = self.client.post(
            reverse('api_results_list_create'),
            data={
                'student': self.student.id,
                'subject': self.subject.id,
                'exam_type': 'Final',
                'marks_obtained': 88,
                'max_marks': 100,
            },
            content_type='application/json'
        )
        self.assertEqual(res.status_code, 201)
        result_id = res.json()['result']['id']

        # List
        list_res = self.client.get(reverse('api_results_list_create'))
        self.assertEqual(list_res.status_code, 200)

        # Delete
        del_res = self.client.delete(reverse('api_result_detail', kwargs={'pk': result_id}))
        self.assertEqual(del_res.status_code, 200)

    def test_analytics_and_rankings_api(self):
        anal_res = self.client.get(reverse('api_analysis_data'))
        self.assertEqual(anal_res.status_code, 200)
        self.assertIn('subject_stats', anal_res.json())

        rank_res = self.client.get(reverse('api_class_rankings_data'))
        self.assertEqual(rank_res.status_code, 200)
        self.assertIn('rankings', rank_res.json())

    def test_chart_apis(self):
        endpoints = [
            'chart_grade_dist',
            'chart_subject_avg',
            'chart_class_performance',
            'chart_top_students',
            'chart_exam_trend',
        ]
        for ep in endpoints:
            res = self.client.get(reverse(ep))
            self.assertEqual(res.status_code, 200)

        # Student chart
        student_chart_res = self.client.get(reverse('chart_student', kwargs={'pk': self.student.id}))
        self.assertEqual(student_chart_res.status_code, 200)
