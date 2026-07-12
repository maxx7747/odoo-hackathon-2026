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