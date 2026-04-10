from django.contrib.auth import get_user_model
from django.contrib.auth import password_validation as django_password_validation
from rest_framework import serializers
from rest_framework_simplejwt.serializers import PasswordField

User = get_user_model()


class UserRegisterInputSerializer(serializers.Serializer):
    username = serializers.CharField(min_length=5)
    password = PasswordField(validators=[django_password_validation.validate_password])
    confirm_password = PasswordField()

    def validate_username(self, value: str) -> str:

        # NOTE: Possible race condition
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("The username is currently unavailable")

        return value

    def validate(self, attrs) -> dict:
        validated: dict = super().validate(attrs)

        if validated.get("password") != validated.get("confirm_password"):
            raise serializers.ValidationError(
                "Passwords do not match.", code="passwords_do_not_match"
            )

        validated.pop("confirm_password")

        return validated
