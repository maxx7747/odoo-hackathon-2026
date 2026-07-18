"""
Seeds the database with a realistic demo dataset so the app looks alive the
moment you run it — useful for local development and for demoing/screenshotting
the project (e.g. for a LinkedIn post or portfolio).

Usage:
    python manage.py seed_demo_data

Safe to re-run: uses get_or_create wherever a natural unique key exists, so it
won't create duplicate rows on a second run.
"""
from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import Department, Employee, Category, SystemSettings
from environmental.models import EmissionFactor, ProductESGProfile, EnvironmentalGoal, CarbonTransaction
from social.models import CSRActivity, EmployeeParticipation, DiversityMetric, TrainingCompletion
from governance.models import ESGPolicy, PolicyAcknowledgement, Audit, ComplianceIssue
from gamification.models import Badge, Reward, Challenge, ChallengeParticipation
from scoring.services import calculate_department_scores

TODAY = date.today()


class Command(BaseCommand):
    help = "Seeds the database with demo departments, employees, activities, badges, etc."

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write("Seeding EcoSphere demo data...")

        SystemSettings.load()

        admin_user, created = User.objects.get_or_create(
            username="admin",
            defaults={"email": "admin@ecosphere.demo", "is_staff": True, "is_superuser": True},
        )
        if created:
            admin_user.set_password("admin12345")
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("  Created superuser 'admin' / password 'admin12345'"))

        departments = {}
        for name, code in [
            ("Operations", "OPS"), ("Engineering", "ENG"),
            ("Human Resources", "HR"), ("Facilities", "FAC"), ("Sales", "SAL"),
        ]:
            dept, _ = Department.objects.get_or_create(code=code, defaults={"name": name})
            departments[code] = dept

        demo_people = [
            ("priya.sharma", "Priya", "Sharma", "OPS", "ESG Program Manager", "female"),
            ("arjun.mehta", "Arjun", "Mehta", "ENG", "Software Engineer", "male"),
            ("sana.khan", "Sana", "Khan", "HR", "HR Business Partner", "female"),
            ("rahul.verma", "Rahul", "Verma", "FAC", "Facilities Lead", "male"),
            ("neha.gupta", "Neha", "Gupta", "SAL", "Sales Manager", "female"),
            ("dev.iyer", "Dev", "Iyer", "ENG", "DevOps Engineer", "male"),
            ("ananya.rao", "Ananya", "Rao", "OPS", "Operations Analyst", "female"),
            ("karan.singh", "Karan", "Singh", "SAL", "Account Executive", "male"),
        ]

        employees = []
        for username, first, last, dept_code, designation, gender in demo_people:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={"first_name": first, "last_name": last, "email": f"{username}@ecosphere.demo"},
            )
            if created:
                user.set_password("demo12345")
                user.save()
            employee, _ = Employee.objects.get_or_create(
                user=user,
                defaults={
                    "department": departments[dept_code],
                    "designation": designation,
                    "gender": gender,
                    "date_joined_org": TODAY - timedelta(days=400),
                },
            )
            employees.append(employee)

        for code, dept in departments.items():
            head = next((e for e in employees if e.department == dept), None)
            if head and not dept.head:
                dept.head = head
                dept.save(update_fields=["head"])

        csr_cat, _ = Category.objects.get_or_create(name="Community Outreach", type="csr_activity")
        env_csr_cat, _ = Category.objects.get_or_create(name="Environmental Volunteering", type="csr_activity")
        fitness_cat, _ = Category.objects.get_or_create(name="Wellness", type="challenge")
        green_cat, _ = Category.objects.get_or_create(name="Green Habits", type="challenge")

        emission_factors = {}
        for name, source_type, unit, value in [
            ("Grid Electricity", "purchase", "kWh", "0.475"),
            ("Diesel (Fleet)", "fleet", "litre", "2.680"),
            ("Air Travel (Economy)", "expense", "km", "0.150"),
            ("Office Paper", "manufacturing", "kg", "1.100"),
        ]:
            ef, _ = EmissionFactor.objects.get_or_create(
                name=name, defaults={"source_type": source_type, "unit": unit, "factor_value": Decimal(value)},
            )
            emission_factors[name] = ef

        ProductESGProfile.objects.get_or_create(
            product_code="PRD-001",
            defaults={
                "product_name": "Recycled Paper Notebook",
                "emission_factor": emission_factors["Office Paper"],
                "sustainability_notes": "Made from 100% post-consumer recycled paper.",
                "recyclable": True,
            },
        )

        EnvironmentalGoal.objects.get_or_create(
            title="Reduce office electricity emissions by 15%",
            defaults={
                "description": "Org-wide initiative to cut grid electricity carbon footprint via LED retrofits and HVAC scheduling.",
                "target_value": Decimal("8500.00"),
                "current_value": Decimal("6200.00"),
                "unit": "kgCO2e",
                "start_date": TODAY - timedelta(days=120),
                "end_date": TODAY + timedelta(days=60),
                "status": "active",
            },
        )

        for i, (source_key, dept_code, qty, days_ago) in enumerate([
            ("Grid Electricity", "FAC", "12000", 10),
            ("Diesel (Fleet)", "OPS", "340", 20),
            ("Air Travel (Economy)", "SAL", "1500", 5),
            ("Office Paper", "HR", "80", 15),
        ]):
            CarbonTransaction.objects.get_or_create(
                source_type=emission_factors[source_key].source_type,
                department=departments[dept_code],
                emission_factor=emission_factors[source_key],
                transaction_date=TODAY - timedelta(days=days_ago),
                defaults={
                    "quantity": Decimal(qty),
                    "is_auto_calculated": True,
                    "source_reference": f"SEED-{i+1:03d}",
                },
            )

        activities = []
        for title, category, dept_code, points, days_ago_start in [
            ("Beach Cleanup Drive", env_csr_cat, "OPS", 50, 30),
            ("Tree Plantation Day", env_csr_cat, "FAC", 40, 20),
            ("Blood Donation Camp", csr_cat, "HR", 30, 15),
            ("Local School Mentorship", csr_cat, "SAL", 25, 10),
        ]:
            activity, _ = CSRActivity.objects.get_or_create(
                title=title,
                defaults={
                    "category": category,
                    "department": departments[dept_code],
                    "start_date": TODAY - timedelta(days=days_ago_start),
                    "end_date": TODAY - timedelta(days=days_ago_start - 2),
                    "points_value": points,
                    "status": "completed",
                },
            )
            activities.append(activity)

        for idx, employee in enumerate(employees):
            activity = activities[idx % len(activities)]
            participation, created = EmployeeParticipation.objects.get_or_create(
                employee=employee, activity=activity,
                defaults={"completion_date": TODAY - timedelta(days=5)},
            )
            if created:
                participation.approval_status = "approved"
                participation.save()

        for dept in departments.values():
            DiversityMetric.objects.get_or_create(
                department=dept, period=TODAY.replace(day=1),
                defaults={
                    "male_count": dept.employees.filter(gender="male").count() or 3,
                    "female_count": dept.employees.filter(gender="female").count() or 2,
                    "non_binary_count": 0,
                    "undisclosed_count": 0,
                },
            )

        for employee in employees[:5]:
            TrainingCompletion.objects.get_or_create(
                employee=employee, training_name="Code of Conduct & Ethics 2026",
                defaults={"completion_date": TODAY - timedelta(days=45), "status": "completed"},
            )

        policies = []
        for title, category in [
            ("Environmental Sustainability Policy", "environmental"),
            ("Anti-Harassment & Diversity Policy", "social"),
            ("Code of Business Conduct", "governance"),
        ]:
            policy, _ = ESGPolicy.objects.get_or_create(
                title=title,
                defaults={"category": category, "effective_date": TODAY - timedelta(days=180), "status": "active"},
            )
            policies.append(policy)

        for employee in employees:
            for policy in policies:
                ack, created = PolicyAcknowledgement.objects.get_or_create(employee=employee, policy=policy)
                if created and employee.id % 2 == 0:
                    ack.acknowledge()

        audit, _ = Audit.objects.get_or_create(
            title="Q2 2026 ESG Compliance Audit",
            defaults={
                "scope": "Environmental and governance controls across all departments.",
                "auditor": "GreenCheck Advisory LLP",
                "audit_date": TODAY - timedelta(days=25),
                "status": "completed",
                "findings_summary": "Two medium-severity findings related to fleet emissions reporting.",
            },
        )
        ComplianceIssue.objects.get_or_create(
            audit=audit,
            description="Fleet fuel consumption logs missing for 2 vehicles in March 2026.",
            defaults={
                "severity": "medium",
                "owner": departments["OPS"].head or employees[0],
                "due_date": TODAY + timedelta(days=10),
                "status": "open",
            },
        )
        ComplianceIssue.objects.get_or_create(
            audit=audit,
            description="Diesel emission factor not reviewed in the last 12 months.",
            defaults={
                "severity": "low",
                "owner": departments["FAC"].head or employees[0],
                "due_date": TODAY - timedelta(days=3),
                "status": "overdue",
            },
        )

        badge_defs = [
            ("Green Starter", {"metric": "total_points", "operator": ">=", "value": 20}, "🌱"),
            ("Sustainability Champion", {"metric": "total_points", "operator": ">=", "value": 100}, "🌳"),
            ("XP Rookie", {"metric": "total_xp", "operator": ">=", "value": 50}, "⚡"),
            ("Challenge Master", {"metric": "completed_challenge_count", "operator": ">=", "value": 3}, "🏆"),
        ]
        for name, rule, icon in badge_defs:
            Badge.objects.get_or_create(name=name, defaults={"unlock_rule": rule, "icon": icon})

        for name, points, stock in [
            ("Eco-Friendly Water Bottle", 30, 25),
            ("Extra Day Off", 200, 10),
            ("Plant-a-Tree Certificate", 15, 100),
        ]:
            Reward.objects.get_or_create(name=name, defaults={"points_required": points, "stock": stock})

        challenges = []
        for title, category, xp, difficulty in [
            ("Bike to Work Week", green_cat, 60, "medium"),
            ("30-Day Step Challenge", fitness_cat, 40, "easy"),
            ("Zero Single-Use Plastic Month", green_cat, 100, "hard"),
        ]:
            challenge, _ = Challenge.objects.get_or_create(
                title=title,
                defaults={
                    "category": category, "xp": xp, "difficulty": difficulty,
                    "deadline": TODAY + timedelta(days=30), "status": "active",
                },
            )
            challenges.append(challenge)

        for idx, employee in enumerate(employees):
            challenge = challenges[idx % len(challenges)]
            participation, created = ChallengeParticipation.objects.get_or_create(
                challenge=challenge, employee=employee, defaults={"progress": 100},
            )
            if created:
                participation.approval = "approved"
                participation.save()

        period = TODAY.replace(day=1)
        try:
            calculate_department_scores(
                period=period,
                period_start=period - timedelta(days=30),
                period_end=period,
            )
            self.stdout.write(self.style.SUCCESS("  Recalculated department & organization ESG scores."))
        except Exception as exc:  # pragma: no cover - defensive, don't fail seeding over scoring
            self.stdout.write(self.style.WARNING(f"  Skipped score calculation: {exc}"))

        self.stdout.write(self.style.SUCCESS(
            "Done. Log in to /admin/ with admin / admin12345, "
            "or get an API token via POST /api/auth-token/ with the same credentials."
        ))
