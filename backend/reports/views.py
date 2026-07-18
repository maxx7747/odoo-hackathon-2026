from django.http import HttpResponse
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import Department, Employee
from gamification.models import Challenge
from .models import SavedReport
from .serializers import SavedReportSerializer
from . import services


def _export_response(report_or_sections, export_format, filename):
    export_format = (export_format or "pdf").lower()
    if export_format not in services.EXPORTERS:
        return Response({"detail": f"Unsupported format '{export_format}'. Use pdf, excel, or csv."},
                         status=status.HTTP_400_BAD_REQUEST)
    exporter, content_type, ext = services.EXPORTERS[export_format]
    content = exporter(report_or_sections)
    response = HttpResponse(content, content_type=content_type)
    response["Content-Disposition"] = f'attachment; filename="{filename}.{ext}"'
    return response


class SavedReportViewSet(viewsets.ModelViewSet):
    queryset = SavedReport.objects.all()
    serializer_class = SavedReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["module", "department", "employee"]


class BaseReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    report_name = "report"

    def _department(self, request):
        dept_id = request.query_params.get("department")
        return Department.objects.filter(pk=dept_id).first() if dept_id else None

    def _dates(self, request):
        return request.query_params.get("date_start"), request.query_params.get("date_end")

    def _format(self, request):
        return request.query_params.get("export_format", "pdf")


class EnvironmentalReportView(BaseReportView):
    report_name = "environmental_report"

    def get(self, request):
        date_start, date_end = self._dates(request)
        report = services.environmental_report(self._department(request), date_start, date_end)
        return _export_response(report, self._format(request), self.report_name)


class SocialReportView(BaseReportView):
    report_name = "social_report"

    def get(self, request):
        date_start, date_end = self._dates(request)
        employee_id = request.query_params.get("employee")
        employee = Employee.objects.filter(pk=employee_id).first() if employee_id else None
        report = services.social_report(self._department(request), date_start, date_end, employee)
        return _export_response(report, self._format(request), self.report_name)


class GovernanceReportView(BaseReportView):
    report_name = "governance_report"

    def get(self, request):
        date_start, date_end = self._dates(request)
        report = services.governance_report(self._department(request), date_start, date_end)
        return _export_response(report, self._format(request), self.report_name)


class ESGSummaryReportView(BaseReportView):
    report_name = "esg_summary_report"

    def get(self, request):
        period = request.query_params.get("period")
        report = services.esg_summary_report(self._department(request), period)
        return _export_response(report, self._format(request), self.report_name)


class CustomReportView(BaseReportView):
    """
    Custom Report Builder. Query params: module, department, employee, challenge,
    esg_category, date_start, date_end, export_format (pdf/excel/csv).
    """
    report_name = "custom_report"

    def get(self, request):
        module = request.query_params.get("module", "all")
        department = self._department(request)
        employee_id = request.query_params.get("employee")
        employee = Employee.objects.filter(pk=employee_id).first() if employee_id else None
        challenge_id = request.query_params.get("challenge")
        challenge = Challenge.objects.filter(pk=challenge_id).first() if challenge_id else None
        esg_category = request.query_params.get("esg_category")
        date_start, date_end = self._dates(request)

        sections = services.custom_report(
            module=module, department=department, employee=employee, challenge=challenge,
            esg_category=esg_category, date_start=date_start, date_end=date_end,
        )
        if not sections:
            return Response({"detail": "No data matched the selected filters."}, status=status.HTTP_404_NOT_FOUND)
        return _export_response(sections, self._format(request), self.report_name)
