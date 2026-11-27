from rest_framework import exceptions


class UsernameTakenAPIError(exceptions.ValidationError):
    default_code = "invalid"
    default_detail = "The username is currently unavailable"

    def __init__(self) -> None:
        # Keyed by field, so the error keeps attr "username" that the register form maps
        super().__init__({"username": [self.default_detail]}, code=self.default_code)
