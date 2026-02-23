from ..models import ProductGroup, ProductGroupCategory


def assign_unique_categories_to_group(
    *, category_ids: list[int], group: ProductGroup
) -> None:
    """Assign unique categories to a productgroup"""

    for cat_id in category_ids:
        ProductGroupCategory.objects.get_or_create(group=group, category_id=cat_id)
