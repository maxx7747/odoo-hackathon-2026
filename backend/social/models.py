from django.db import models
from core.models import TimeStampedModel, Department, Category, Employee


class CSRActivity(TimeStampedModel):
    STATUS_CHOICES = [
        ("draft", "Draft"), ("active", "Active"),
        ("completed", "Completed"), ("archived", "Archived"),
    ]

    title = models.CharField(max_length=200)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True,
                                  limit_choices_to={"type": "csr_activity"}, related_name="csr_activities")
    description = models.TextField(blank=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True,
                                    related_name="csr_activities")
    start_date = models.DateField()
    end_date = models.DateField()
    points_value = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="draft")

    def __str__(self):
        return self.title


class EmployeeParticipation(TimeStampedModel):
    APPROVAL_CHOICES = [
        ("pending", "Pending"), ("approved", "Approved"), ("rejected", "Rejected"),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="csr_participations")
    activity = models.ForeignKey(CSRActivity, on_delete=models.CASCADE, related_name="participations")
    proof = models.FileField(upload_to="csr_proofs/", null=True, blank=True)
    approval_status = models.CharField(max_length=10, choices=APPROVAL_CHOICES, default="pending")
    points_earned = models.PositiveIntegerField(default=0)
    completion_date = models.DateField(null=True, blank=True)

    class Meta:
        unique_together = ["employee", "activity"]

    def __str__(self):
        return f"{self.employee} @ {self.activity} ({self.approval_status})"


class DiversityMetric(TimeStampedModel):
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name="diversity_metrics")
    period = models.DateField(help_text="Reporting period, e.g. first day of the month/quarter")
    male_count = models.PositiveIntegerField(default=0)
    female_count = models.PositiveIntegerField(default=0)
    non_binary_count = models.PositiveIntegerField(default=0)
    undisclosed_count = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ["department", "period"]
        ordering = ["-period"]

    def __str__(self):
        return f"{self.department} diversity @ {self.period}"

    @property
    def total(self):
        return self.male_count + self.female_count + self.non_binary_count + self.undisclosed_count


class TrainingCompletion(TimeStampedModel):
    STATUS_CHOICES = [("in_progress", "In Progress"), ("completed", "Completed"), ("overdue", "Overdue")]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="training_completions")
    training_name = models.CharField(max_length=200)
    completion_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default="in_progress")

    def __str__(self):
        return f"{self.employee} - {self.training_name} ({self.status})"
