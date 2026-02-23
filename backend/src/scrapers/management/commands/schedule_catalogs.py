from django.core.management import BaseCommand


class Command(BaseCommand):
    def handle(self, *args, **options) -> None:
        from ...tasks import schedule_pharmacy_catalogs_scrape

        schedule_pharmacy_catalogs_scrape()
