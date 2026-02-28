from django.contrib.auth import get_user_model, password_validation
from rest_framework import serializers
from rest_framework_simplejwt.serializers import PasswordField

User = get_user_model()


class UserRegisterSerializer(serializers.ModelSerializer):
    password = PasswordField()
    confirm_password = PasswordField()
    access = serializers.SerializerMethodField()
    refresh = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["username", "password", "confirm_password", "access", "refresh"]
        read_only_fields = ["access", "refresh"]

    def validate_password(self, value: str) -> str:
        password_validation.validate_password(value)

        return value

    def validate_username(self, value: str) -> str:

        if len(value) < 5:
            raise serializers.ValidationError("Username must have 5 or more characters")

        return value

    def validate(self, attrs) -> dict:
        validated = super().validate(attrs)

        if attrs.get("password") != attrs.get("confirm_password"):
            raise serializers.ValidationError("Passwords do not match.")

        return validated

    def get_access(self, instance) -> str:
        return self.context.get("token_pair", {}).get("access")

    def get_refresh(self, instance) -> str:
        return self.context.get("token_pair", {}).get("refresh")
