import factory
from django.contrib.auth.models import User
from factory.django import DjangoModelFactory

DEFAULT_PASSWORD = "correct-horse-battery"


class UserFactory(DjangoModelFactory[User]):
    class Meta:
        model = User
        skip_postgeneration_save = True

    username = factory.Sequence(lambda n: f"user{n}")
    password = factory.django.Password(DEFAULT_PASSWORD)
