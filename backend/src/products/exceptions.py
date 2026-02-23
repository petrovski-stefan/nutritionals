from rest_framework import exceptions, status


class ProductSearchQueryEmptyAPIError(exceptions.APIException):
    default_code = "query_required"
    default_detail = "Query key is required for searching"
    status_code = status.HTTP_400_BAD_REQUEST


class ProductSearchQueryShortAPIError(exceptions.APIException):
    default_code = "query_short"
    default_detail = "Query should have length at least 3 for searching"
    status_code = status.HTTP_400_BAD_REQUEST
