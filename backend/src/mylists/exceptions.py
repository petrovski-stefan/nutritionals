from rest_framework import exceptions, status


class MyListNameByUserAlreadyExist(exceptions.APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_code = "unique_together_name_user"
    default_detail = "The user has already created a mylist with the passed name."


class ProductInMyListAlreadyExists(exceptions.APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_code = "unique_together_product_mylist"
    default_detail = "The mylist already includes the passed product."


class MyListItemNotFound(exceptions.NotFound):
    default_detail = "MyListItem not found"
    default_code = "mylistitem_not_found"
