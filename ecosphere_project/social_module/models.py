from django.db import models
from django.contrib.auth.models import User

# Master Data
class Category(models.Model):
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=50, default="CSR Activity") 
    status = models.BooleanField(default=True)

    def __str__(self):
        return self.name

# Transactional Data
class CSRActivity(models.Model):
    title = models.CharField(max_length=200) 
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    description = models.TextField()
    date_organized = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.title

class EmployeeParticipation(models.Model):
    
    employee = models.ForeignKey(User, on_delete=models.CASCADE)
    activity = models.ForeignKey(CSRActivity, on_delete=models.CASCADE)
    proof = models.FileField(upload_to='proofs/', null=True, blank=True) 
    approval_status = models.CharField(max_length=20, choices=[('Pending', 'Pending'), ('Approved', 'Approved')], default='Pending')
    points_earned = models.IntegerField(default=0)
    completion_date = models.DateField(auto_now_add=True)

class DiversityMetric(models.Model):
    department_name = models.CharField(max_length=100)
    female_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    minority_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    recorded_date = models.DateField(auto_now_add=True)

class TrainingCompletion(models.Model):
    employee = models.ForeignKey(User, on_delete=models.CASCADE)
    training_name = models.CharField(max_length=200)
    completed = models.BooleanField(default=False)
    completion_date = models.DateField(null=True, blank=True)

class DepartmentSocialScore(models.Model):
    department_name = models.CharField(max_length=100)
    social_score = models.IntegerField(default=0) 
    last_updated = models.DateTimeField(auto_now=True)