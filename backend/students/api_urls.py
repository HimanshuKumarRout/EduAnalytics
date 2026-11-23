from django.urls import path
from . import api_views

urlpatterns = [
    # Dashboard & General
    path('dashboard/',            api_views.api_dashboard_data,  name='api_dashboard_data'),

    # Students CRUD
    path('students/',             api_views.api_students,        name='api_students_list_create'),
    path('students/<int:pk>/',    api_views.api_student_detail,  name='api_student_detail'),

    # Subjects CRUD
    path('subjects/',             api_views.api_subjects,        name='api_subjects_list_create'),
    path('subjects/<int:pk>/',    api_views.api_subject_detail,  name='api_subject_detail'),

    # Results CRUD
    path('results/',              api_views.api_results,         name='api_results_list_create'),
    path('results/<int:pk>/',     api_views.api_result_detail,   name='api_result_detail'),

    # Analytics & Rankings
    path('analysis/',             api_views.api_analysis,        name='api_analysis_data'),
    path('class-rankings/',       api_views.api_class_rankings,  name='api_class_rankings_data'),

    # Upload Data
    path('upload/',               api_views.api_upload_data,     name='api_upload_data'),

    # Chart Endpoints
    path('chart/grade-dist/',        api_views.api_grade_dist,         name='chart_grade_dist'),
    path('chart/subject-avg/',       api_views.api_subject_avg,        name='chart_subject_avg'),
    path('chart/class-performance/', api_views.api_class_performance,  name='chart_class_performance'),
    path('chart/student/<int:pk>/',  api_views.api_student_chart,      name='chart_student'),
    path('chart/top-students/',      api_views.api_top_students,       name='chart_top_students'),
    path('chart/exam-trend/',        api_views.api_exam_trend,         name='chart_exam_trend'),
]
