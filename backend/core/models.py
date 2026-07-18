from django.conf import settings
from django.db import models


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Department(TimeStampedModel):
    STATUS_CHOICES = [("active", "Active"), ("inactive", "Inactive")]

    name = models.CharField(max_length=150)
    code = models.CharField(max_length=30, unique=True)
    head = models.ForeignKey(
        "core.Employee", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="headed_departments",
    )
    parent_department = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="sub_departments"
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="active")

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.code})"

    @property
    def employee_count(self):
        return self.employees.filter(status="active").count()


class Employee(TimeStampedModel):
    GENDER_CHOICES = [
        ("male", "Male"), ("female", "Female"),
        ("non_binary", "Non-binary"), ("undisclosed", "Prefer not to say"),
    ]
    STATUS_CHOICES = [("active", "Active"), ("inactive", "Inactive")]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="employee_profile")
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name="employees")
    designation = models.CharField(max_length=120, blank=True)
    gender = models.CharField(max_length=15, choices=GENDER_CHOICES, default="undisclosed")
    date_of_birth = models.DateField(null=True, blank=True)
    date_joined_org = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="active")

    # Cached gamification totals (kept in sync via gamification signals)
    total_xp = models.PositiveIntegerField(default=0)
    total_points = models.PositiveIntegerField(default=0)
    completed_challenge_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.user.get_full_name() or self.user.username


class Category(TimeStampedModel):
    TYPE_CHOICES = [("csr_activity", "CSR Activity"), ("challenge", "Challenge")]
    STATUS_CHOICES = [("active", "Active"), ("inactive", "Inactive")]

    name = models.CharField(max_length=120)
    type = models.CharField(max_length=15, choices=TYPE_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="active")

    class Meta:
        verbose_name_plural = "Categories"
        unique_together = ["name", "type"]

    def __str__(self):
        return f"{self.name} [{self.get_type_display()}]"


class SystemSettings(TimeStampedModel):
    """Singleton holding the Settings -> ESG Configuration toggles."""
    auto_emission_calculation = models.BooleanField(default=True)
    evidence_required_for_csr = models.BooleanField(default=True)
    badge_auto_award = models.BooleanField(default=True)

    weight_environmental = models.DecimalField(max_digits=5, decimal_places=2, default=40.00)
    weight_social = models.DecimalField(max_digits=5, decimal_places=2, default=30.00)
    weight_governance = models.DecimalField(max_digits=5, decimal_places=2, default=30.00)

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return "ESG System Configuration"
