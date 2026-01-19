from django.core.management import BaseCommand


class Command(BaseCommand):
    def handle(self, *args, **options) -> None:
        from ...tasks import schedule_pharmacies_catalogue_scrape

        schedule_pharmacies_catalogue_scrape()
