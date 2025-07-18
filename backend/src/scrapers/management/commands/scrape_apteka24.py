from django.core.management import BaseCommand


class Command(BaseCommand):
    def handle(self, *args, **options) -> None:
        from ...tasks import scrape_apteka24

        scrape_apteka24()
