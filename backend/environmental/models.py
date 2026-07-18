from django.db import models
from core.models import TimeStampedModel, Department


class EmissionFactor(TimeStampedModel):
    SOURCE_TYPE_CHOICES = [
        ("purchase", "Purchase"),
        ("manufacturing", "Manufacturing"),
        ("expense", "Expense"),
        ("fleet", "Fleet"),
    ]
    STATUS_CHOICES = [("active", "Active"), ("inactive", "Inactive")]

    name = models.CharField(max_length=150)
    source_type = models.CharField(max_length=20, choices=SOURCE_TYPE_CHOICES)
    unit = models.CharField(max_length=30, help_text="Unit the factor applies to, e.g. kg, litre, kWh, km")
    factor_value = models.DecimalField(max_digits=12, decimal_places=6, help_text="kg CO2e per unit")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="active")

    def __str__(self):
        return f"{self.name} ({self.factor_value} kgCO2e/{self.unit})"


class ProductESGProfile(TimeStampedModel):
    STATUS_CHOICES = [("active", "Active"), ("inactive", "Inactive")]

    product_name = models.CharField(max_length=150)
    product_code = models.CharField(max_length=60, unique=True)
    emission_factor = models.ForeignKey(EmissionFactor, on_delete=models.SET_NULL, null=True, blank=True,
                                         related_name="product_profiles")
    sustainability_notes = models.TextField(blank=True)
    recyclable = models.BooleanField(default=False)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="active")

    def __str__(self):
        return f"{self.product_name} ({self.product_code})"


class EnvironmentalGoal(TimeStampedModel):
    STATUS_CHOICES = [("active", "Active"), ("achieved", "Achieved"), ("missed", "Missed"), ("archived", "Archived")]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True,
                                    related_name="environmental_goals", help_text="Blank = organization-wide goal")
    target_value = models.DecimalField(max_digits=14, decimal_places=2, help_text="e.g. kg CO2e to reduce to")
    current_value = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    unit = models.CharField(max_length=30, default="kgCO2e")
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="active")

    def __str__(self):
        return self.title

    @property
    def progress_percent(self):
        if not self.target_value:
            return 0
        return round(float(self.current_value) / float(self.target_value) * 100, 2)


class CarbonTransaction(TimeStampedModel):
    SOURCE_TYPE_CHOICES = EmissionFactor.SOURCE_TYPE_CHOICES

    source_type = models.CharField(max_length=20, choices=SOURCE_TYPE_CHOICES)
    source_reference = models.CharField(
        max_length=100, blank=True,
        help_text="Reference id/number of the originating Purchase/Manufacturing/Expense/Fleet record"
    )
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True,
                                    related_name="carbon_transactions")
    emission_factor = models.ForeignKey(EmissionFactor, on_delete=models.PROTECT, related_name="carbon_transactions")
    quantity = models.DecimalField(max_digits=14, decimal_places=4)
    calculated_emission = models.DecimalField(max_digits=14, decimal_places=4, editable=False)
    transaction_date = models.DateField()
    is_auto_calculated = models.BooleanField(default=False)

    class Meta:
        ordering = ["-transaction_date"]

    def save(self, *args, **kwargs):
        self.calculated_emission = self.quantity * self.emission_factor.factor_value
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.get_source_type_display()} - {self.calculated_emission} kgCO2e on {self.transaction_date}"
