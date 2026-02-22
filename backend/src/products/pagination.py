from rest_framework import pagination


class ProductGroupPagePagination(pagination.PageNumberPagination):
    page_size = 6
    max_page_size = 6
