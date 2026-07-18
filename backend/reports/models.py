from django.db import models
from core.models import TimeStampedModel


class SavedReport(TimeStampedModel):
    """A reusable Custom Report Builder configuration."""
    FORMAT_CHOICES = [("pdf", "PDF"), ("excel", "Excel"), ("csv", "CSV")]
    MODULE_CHOICES = [
        ("environmental", "Environmental"), ("social", "Social"),
        ("governance", "Governance"), ("gamification", "Gamification"), ("all", "All modules"),
    ]

    name = models.CharField(max_length=150)
    module = models.CharField(max_length=15, choices=MODULE_CHOICES, default="all")
    department = models.ForeignKey("core.Department", on_delete=models.SET_NULL, null=True, blank=True)
    employee = models.ForeignKey("core.Employee", on_delete=models.SET_NULL, null=True, blank=True)
    esg_category = models.CharField(max_length=15, blank=True,
                                     help_text="environmental / social / governance, blank = all")
    challenge = models.ForeignKey("gamification.Challenge", on_delete=models.SET_NULL, null=True, blank=True)
    date_start = models.DateField(null=True, blank=True)
    date_end = models.DateField(null=True, blank=True)
    export_format = models.CharField(max_length=10, choices=FORMAT_CHOICES, default="pdf")

    def __str__(self):
        return self.name
