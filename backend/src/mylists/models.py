from common.models import BaseModel
from django.contrib.auth import get_user_model
from django.db import models
from django.db.models.constraints import UniqueConstraint

User = get_user_model()


class MyListItem(BaseModel):
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE)
    mylist = models.ForeignKey("MyList", on_delete=models.CASCADE)
    is_added_through_smart_search = models.BooleanField(default=False)

    class Meta:
        constraints = [
            UniqueConstraint(
                fields=["product", "mylist"], name="unique_together_product_mylist"
            )
        ]

    def __str__(self) -> str:
        return f"MyListItem {self.id}"


class MyList(BaseModel):
    name = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    products = models.ManyToManyField("products.Product", through=MyListItem)

    class Meta:
        constraints = [
            UniqueConstraint(fields=["name", "user"], name="unique_together_name_user")
        ]

    def __str__(self) -> str:
        return self.name
