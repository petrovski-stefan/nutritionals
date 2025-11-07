from rest_framework import exceptions


class ProductIdQueryParamMissingError(exceptions.APIException):
    status_code = 400
