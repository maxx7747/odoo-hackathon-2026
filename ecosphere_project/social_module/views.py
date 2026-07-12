from django.http import HttpResponse
from reportlab.pdfgen import canvas
from rest_framework import viewsets
from .models import Category, CSRActivity, EmployeeParticipation, DiversityMetric, TrainingCompletion, DepartmentSocialScore
from .serializers import (CategorySerializer, CSRActivitySerializer, 
                          EmployeeParticipationSerializer, DiversityMetricSerializer, 
                          TrainingCompletionSerializer, DepartmentSocialScoreSerializer)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class CSRActivityViewSet(viewsets.ModelViewSet):
    queryset = CSRActivity.objects.all()
    serializer_class = CSRActivitySerializer

class EmployeeParticipationViewSet(viewsets.ModelViewSet):
    queryset = EmployeeParticipation.objects.all()
    serializer_class = EmployeeParticipationSerializer

class DiversityMetricViewSet(viewsets.ModelViewSet):
    queryset = DiversityMetric.objects.all()
    serializer_class = DiversityMetricSerializer

class TrainingCompletionViewSet(viewsets.ModelViewSet):
    queryset = TrainingCompletion.objects.all()
    serializer_class = TrainingCompletionSerializer

class DepartmentSocialScoreViewSet(viewsets.ModelViewSet):
    queryset = DepartmentSocialScore.objects.all()
    serializer_class = DepartmentSocialScoreSerializer

from datetime import date

def generate_report(request):
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="social_report.pdf"'

    p = canvas.Canvas(response)

    # Fetch data
    csr_count = CSRActivity.objects.count()
    participation_count = EmployeeParticipation.objects.count()
    training_count = TrainingCompletion.objects.count()
    diversity_count = DiversityMetric.objects.count()
    score_count = DepartmentSocialScore.objects.count()

    # Title
    p.setFont("Helvetica-Bold", 20)
    p.drawString(170, 800, "Social ESG Report")

    # Date
    p.setFont("Helvetica", 11)
    p.drawString(50, 775, f"Generated on: {date.today()}")

    # Line
    p.line(50, 765, 550, 765)

    y = 730

    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, y, "Summary")
    y -= 30

    p.setFont("Helvetica", 12)
    p.drawString(70, y, f"CSR Activities: {csr_count}")
    y -= 25

    p.drawString(70, y, f"Employee Participation Records: {participation_count}")
    y -= 25

    p.drawString(70, y, f"Training Completion Records: {training_count}")
    y -= 25

    p.drawString(70, y, f"Diversity Metrics: {diversity_count}")
    y -= 25

    p.drawString(70, y, f"Department Social Scores: {score_count}")

    p.setFont("Helvetica-Oblique", 10)
    p.drawString(50, 50, "EcoSphere ESG Management System")

    p.showPage()
    p.save()

    return response