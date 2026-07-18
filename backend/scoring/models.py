from django.db import models
from core.models import TimeStampedModel, Department


class DepartmentScore(TimeStampedModel):
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name="scores")
    period = models.DateField(help_text="Reporting period, e.g. first day of the month/quarter")
    environmental_score = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    social_score = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    governance_score = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    total_score = models.DecimalField(max_digits=6, decimal_places=2, default=0, editable=False)

    class Meta:
        unique_together = ["department", "period"]
        ordering = ["-period", "-total_score"]

    def compute_total(self, weight_e, weight_s, weight_g):
        total_weight = weight_e + weight_s + weight_g or 1
        self.total_score = (
            self.environmental_score * weight_e
            + self.social_score * weight_s
            + self.governance_score * weight_g
        ) / total_weight
        return self.total_score

    def __str__(self):
        return f"{self.department} @ {self.period}: {self.total_score}"


class OrganizationScore(TimeStampedModel):
    """Weighted average of all Department Total Scores for a given period."""
    period = models.DateField(unique=True)
    environmental_score = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    social_score = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    governance_score = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    overall_score = models.DecimalField(max_digits=6, decimal_places=2, default=0)

    class Meta:
        ordering = ["-period"]

    def __str__(self):
        return f"Org ESG Score @ {self.period}: {self.overall_score}"
