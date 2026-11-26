from rest_framework import pagination


class ProductGroupPagePagination(pagination.PageNumberPagination):
    page_size = 6
    # Compare asks for more per page; larger requests are capped, not rejected
    page_size_query_param = "page_size"
    max_page_size = 24
