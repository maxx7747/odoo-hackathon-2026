from django.db import models
from core.models import TimeStampedModel, Category, Employee


class Badge(TimeStampedModel):
    """
    unlock_rule example (JSON):
      {"metric": "total_xp", "operator": ">=", "value": 500}
      {"metric": "completed_challenge_count", "operator": ">=", "value": 10}
      {"metric": "total_points", "operator": ">=", "value": 1000}
    """
    STATUS_CHOICES = [("active", "Active"), ("inactive", "Inactive")]

    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    unlock_rule = models.JSONField(default=dict, help_text='e.g. {"metric": "total_xp", "operator": ">=", "value": 500}')
    icon = models.CharField(max_length=255, blank=True, help_text="Icon name or URL")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="active")

    def __str__(self):
        return self.name


class EmployeeBadge(TimeStampedModel):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="badges")
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name="awarded_to")
    awarded_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["employee", "badge"]

    def __str__(self):
        return f"{self.employee} earned {self.badge}"


class Reward(TimeStampedModel):
    STATUS_CHOICES = [("active", "Active"), ("inactive", "Inactive")]

    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    points_required = models.PositiveIntegerField()
    stock = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="active")

    def __str__(self):
        return f"{self.name} ({self.points_required} pts)"


class RewardRedemption(TimeStampedModel):
    STATUS_CHOICES = [("completed", "Completed"), ("cancelled", "Cancelled")]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="redemptions")
    reward = models.ForeignKey(Reward, on_delete=models.PROTECT, related_name="redemptions")
    points_deducted = models.PositiveIntegerField(editable=False)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="completed")
    redeemed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee} redeemed {self.reward}"


class Challenge(TimeStampedModel):
    DIFFICULTY_CHOICES = [("easy", "Easy"), ("medium", "Medium"), ("hard", "Hard")]
    STATUS_CHOICES = [
        ("draft", "Draft"), ("active", "Active"), ("under_review", "Under Review"),
        ("completed", "Completed"), ("archived", "Archived"),
    ]

    title = models.CharField(max_length=200)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True,
                                  limit_choices_to={"type": "challenge"}, related_name="challenges")
    description = models.TextField(blank=True)
    xp = models.PositiveIntegerField(default=0)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default="medium")
    evidence_required = models.BooleanField(default=True)
    deadline = models.DateField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default="draft")

    def __str__(self):
        return self.title


class ChallengeParticipation(TimeStampedModel):
    APPROVAL_CHOICES = [("pending", "Pending"), ("approved", "Approved"), ("rejected", "Rejected")]

    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE, related_name="participations")
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="challenge_participations")
    progress = models.PositiveIntegerField(default=0, help_text="Percent complete, 0-100")
    proof = models.FileField(upload_to="challenge_proofs/", null=True, blank=True)
    approval = models.CharField(max_length=10, choices=APPROVAL_CHOICES, default="pending")
    xp_awarded = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ["challenge", "employee"]

    def __str__(self):
        return f"{self.employee} @ {self.challenge} ({self.approval})"
