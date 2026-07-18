from datetime import date

from django.core.management.base import BaseCommand
from django.core.management import CommandError

from scoring.services import calculate_department_scores


class Command(BaseCommand):
    help = "Recalculates Department and Organization ESG scores for a reporting period."

    def add_arguments(self, parser):
        parser.add_argument("--period", required=True, help="Period label date, YYYY-MM-DD")
        parser.add_argument("--start", required=True, help="Period start date, YYYY-MM-DD")
        parser.add_argument("--end", required=True, help="Period end date, YYYY-MM-DD")

    def handle(self, *args, **options):
        try:
            period = date.fromisoformat(options["period"])
            start = date.fromisoformat(options["start"])
            end = date.fromisoformat(options["end"])
        except ValueError as exc:
            raise CommandError(f"Invalid date: {exc}")

        results = calculate_department_scores(period, start, end)
        self.stdout.write(self.style.SUCCESS(f"Recalculated scores for {len(results)} department(s)."))
