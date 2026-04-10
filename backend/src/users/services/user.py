from django.contrib.auth import get_user_model

User = get_user_model()


def create_user(username: str, password: str) -> User:
    # NOTE: Possible race condition, IntegrityError should be handled

    return User.objects.create_user(username=username, password=password)
