from rest_framework import serializers
from .models import SavedReport


class SavedReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedReport
        fields = ["id", "name", "module", "department", "employee", "esg_category", "challenge",
                  "date_start", "date_end", "export_format"]
