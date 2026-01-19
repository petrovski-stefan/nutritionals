CATALOG_PRODUCT_CARD = "main > div > ul > li.product"
CATALOG_PRODUCT_CARD_NAME = "h2.woocommerce-loop-product__title"
CATALOG_PRODUCT_CARD_URL = "div.product-content > a"
CATALOG_PRODUCT_CARD_BRAND = "div.product-content span.yith-wcbr-brands"
CATALOG_PRODUCT_CARD_PRICES = "div.product-content > a > span.price span.amount"

CATALOG_PRODUCT_CARD_ONLY_PRICE = "div.product-content > a > span.price > span.amount"

CATALOG_PRODUCT_CARD_SPANS_FOR_VALIDATION = (
    "div.product-content > a > span.price > span"
)

CATALOG_PRODUCT_CARD_PRICE = "div.product-content > a > span.price > del > span.amount"
CATALOG_PRODUCT_CARD_DISCOUNT_PRICE = (
    "div.product-content > a > span.price > ins > span.amount"
)


PRODUCT_NAME = "div.summary.entry-summary > h1"
PRODUCT_PRICE = "div.summary.entry-summary > p.price > span:nth-of-type(1)"
PRODUCT_DISCOUNT_PRICE = "div.summary.entry-summary > p.price > span:nth-of-type(2)"
PRODUCT_BRAND = "div.summary.entry-summary > span.yith-wcbr-brands > span"
PRODUCT_TAGS = "div.product_meta > span.tagged_as a"
PRODUCT_DESCRIPTION = "#tab-description"
