from django.core.management import BaseCommand


class Command(BaseCommand):
    def handle(self, *args, **options) -> None:
        from ...tasks import schedule_product_detail_scrape

        schedule_product_detail_scrape()
