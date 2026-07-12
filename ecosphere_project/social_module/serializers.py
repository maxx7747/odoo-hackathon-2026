from rest_framework import serializers
from .models import Category, CSRActivity, EmployeeParticipation, DiversityMetric, TrainingCompletion, DepartmentSocialScore

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class CSRActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = CSRActivity
        fields = '__all__'

class EmployeeParticipationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeParticipation
        fields = '__all__'

class DiversityMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiversityMetric
        fields = '__all__'

class TrainingCompletionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingCompletion
        fields = '__all__'

class DepartmentSocialScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = DepartmentSocialScore
        fields = '__all__'