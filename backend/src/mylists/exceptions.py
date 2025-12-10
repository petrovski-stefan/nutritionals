from rest_framework import exceptions, status


class MyListNameByUserAlreadyExistsAPIException(exceptions.APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_code = "unique_together_name_user"
    default_detail = "The user has already created a mylist with the passed name."


class ProductAlreadyExistsInMyListAPIException(exceptions.APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_code = "unique_together_product_my_list"
    default_detail = "The mylist already includes the passed product."
