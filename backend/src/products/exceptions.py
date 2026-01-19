from rest_framework import exceptions, status


class SmartSearchQueryEmptyAPIError(exceptions.APIException):
    default_code = status.HTTP_400_BAD_REQUEST
