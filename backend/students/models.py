from django.db import models
from django.core.validators import MinValueValidator


GRADE_CHOICES = [
    ('A+', 'A+ (95-100)'),
    ('A',  'A  (90-94)'),
    ('A-', 'A- (85-89)'),
    ('B+', 'B+ (80-84)'),
    ('B',  'B  (75-79)'),
    ('B-', 'B- (70-74)'),
    ('C+', 'C+ (65-69)'),
    ('C',  'C  (60-64)'),
    ('C-', 'C- (55-59)'),
    ('D',  'D  (50-54)'),
    ('F',  'F  (0-49)'),
]

GENDER_CHOICES = [('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')]

class Student(models.Model):
    student_id   = models.CharField(max_length=20, unique=True)
    first_name   = models.CharField(max_length=50)
    last_name    = models.CharField(max_length=50)
    email        = models.EmailField(unique=True)
    gender       = models.CharField(max_length=10, choices=GENDER_CHOICES)
    date_of_birth = models.DateField(null=True, blank=True)
    class_name   = models.CharField(max_length=20)
    section      = models.CharField(max_length=5, blank=True)
    roll_number  = models.IntegerField(null=True, blank=True)
    parent_name  = models.CharField(max_length=100, blank=True)
    contact      = models.CharField(max_length=15, blank=True)
    address      = models.TextField(blank=True)
    photo        = models.ImageField(upload_to='student_photos/', null=True, blank=True)
    enrolled_on  = models.DateField(auto_now_add=True)
    is_active    = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.student_id})"

    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def average_score(self):
        results = self.results.all()
        if not results:
            return 0
        total = sum(r.total_marks for r in results)
        return round(total / len(results), 2)

    def overall_grade(self):
        avg = self.average_score()
        if avg >= 95: return 'A+'
        elif avg >= 90: return 'A'
        elif avg >= 85: return 'A-'
        elif avg >= 80: return 'B+'
        elif avg >= 75: return 'B'
        elif avg >= 70: return 'B-'
        elif avg >= 65: return 'C+'
        elif avg >= 60: return 'C'
        elif avg >= 55: return 'C-'
        elif avg >= 50: return 'D'
        return 'F'

    def rank_in_class(self):
        students = Student.objects.filter(class_name=self.class_name, is_active=True)
        sorted_students = sorted(students, key=lambda s: s.average_score(), reverse=True)
        for i, s in enumerate(sorted_students, 1):
            if s.id == self.id:
                return i
        return None

    class Meta:
        ordering = ['class_name', 'roll_number']


class Subject(models.Model):
    name       = models.CharField(max_length=100)
    code       = models.CharField(max_length=20, unique=True)
    max_marks  = models.IntegerField(default=100)
    class_name = models.CharField(max_length=20)
    teacher    = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

    class Meta:
        ordering = ['name']


class ExamResult(models.Model):
    EXAM_TYPES = [
        ('Unit Test 1', 'Unit Test 1'),
        ('Unit Test 2', 'Unit Test 2'),
        ('Mid Term',    'Mid Term'),
        ('Pre Final',   'Pre Final'),
        ('Final',       'Final'),
        ('Assignment',  'Assignment'),
        ('Quiz',        'Quiz'),
    ]

    student      = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='results')
    subject      = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='results')
    exam_type    = models.CharField(max_length=20, choices=EXAM_TYPES)
    exam_date    = models.DateField()
    marks_obtained = models.FloatField(validators=[MinValueValidator(0)])
    max_marks    = models.FloatField(default=100)
    grade        = models.CharField(max_length=3, choices=GRADE_CHOICES, blank=True)
    remarks      = models.TextField(blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    @property
    def total_marks(self):
        return round((self.marks_obtained / self.max_marks) * 100, 2)

    @property
    def percentage(self):
        return self.total_marks

    def save(self, *args, **kwargs):
        pct = self.total_marks
        if pct >= 95:   self.grade = 'A+'
        elif pct >= 90: self.grade = 'A'
        elif pct >= 85: self.grade = 'A-'
        elif pct >= 80: self.grade = 'B+'
        elif pct >= 75: self.grade = 'B'
        elif pct >= 70: self.grade = 'B-'
        elif pct >= 65: self.grade = 'C+'
        elif pct >= 60: self.grade = 'C'
        elif pct >= 55: self.grade = 'C-'
        elif pct >= 50: self.grade = 'D'
        else:           self.grade = 'F'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student} - {self.subject} - {self.exam_type}"

    class Meta:
        ordering = ['-exam_date']
        unique_together = ['student', 'subject', 'exam_type']


class Attendance(models.Model):
    student       = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance')
    date          = models.DateField()
    is_present    = models.BooleanField(default=True)
    subject       = models.ForeignKey(Subject, on_delete=models.CASCADE, null=True, blank=True)
    remarks       = models.CharField(max_length=200, blank=True)

    class Meta:
        unique_together = ['student', 'date', 'subject']

    def __str__(self):
        status = 'Present' if self.is_present else 'Absent'
        return f"{self.student} - {self.date} - {status}"
