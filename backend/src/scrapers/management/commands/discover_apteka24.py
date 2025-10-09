from django.core.management import BaseCommand


class Command(BaseCommand):
    def handle(self, *args, **options) -> None:
        from ...tasks import discover_apteka24

        discover_apteka24()
