from datetime import timedelta

import pytest
from django.utils import timezone

from products.models import Pharmacy
from products.services import pharmacy as pharmacy_service
from products.tests.factories import PharmacyCatalogFactory, PharmacyFactory, ProductFactory

pytestmark = pytest.mark.django_db


def test_list_pharmacies_annotates_product_count_and_last_scrape() -> None:
    now = timezone.now()
    busy = PharmacyFactory(name="B pharmacy")
    ProductFactory(pharmacy=busy, last_scraped_at=now - timedelta(days=1))
    ProductFactory(pharmacy=busy, last_scraped_at=now, is_reviewed=False)
    PharmacyFactory(name="A pharmacy")

    result = [
        (p.name, p.num_products, p.last_scraped_at) for p in pharmacy_service.list_pharmacies()
    ]

    assert result == [("A pharmacy", 0, None), ("B pharmacy", 2, now)]


def test_list_stale_pharmacies() -> None:
    now = timezone.now()
    stale_scrape = now - timedelta(days=2)

    stale = PharmacyCatalogFactory(pharmacy__name="Stale").pharmacy
    ProductFactory(pharmacy=stale, last_scraped_at=stale_scrape)
    ProductFactory(pharmacy=stale, last_scraped_at=stale_scrape - timedelta(days=1))

    PharmacyCatalogFactory(pharmacy__name="Never")

    fresh = PharmacyCatalogFactory(pharmacy__name="Fresh").pharmacy
    ProductFactory(pharmacy=fresh, last_scraped_at=stale_scrape)
    ProductFactory(pharmacy=fresh, last_scraped_at=now)

    PharmacyCatalogFactory(pharmacy__name="Inactive", is_active=False)
    PharmacyFactory(name="No catalog")

    result = pharmacy_service.list_stale_pharmacies(scraped_before=now - timedelta(hours=36))

    assert result == [("Never", None), ("Stale", stale_scrape)]


def test_with_catalog_counts() -> None:
    pharmacy = PharmacyFactory()
    PharmacyCatalogFactory(pharmacy=pharmacy, max_pages=3)
    PharmacyCatalogFactory(pharmacy=pharmacy, max_pages=5)

    annotated = pharmacy_service.with_catalog_counts(queryset=Pharmacy.objects.all()).get()

    assert (annotated.catalog_count, annotated.total_pages_count) == (2, 8)
