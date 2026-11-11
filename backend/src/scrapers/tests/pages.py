"""Catalog pages trimmed to the markup each scraper's selectors read"""

# Each page holds one valid card and one invalid card, which validation drops

ANNIFARM_PAGE = """
<div class="shop-container">
  <div class="product-small col">
    <p class="woocommerce-loop-product__title">Solgar Vitamin C 1000mg</p>
    <span class="price"><span class="amount">1,200 ден</span></span>
    <a class="woocommerce-LoopProduct-link woocommerce-loop-product__link"
       href=" https://annifarm.com.mk/p/vitamin-c/ "></a>
  </div>
  <div class="product-small col">
    <p class="woocommerce-loop-product__title">No price</p>
    <a class="woocommerce-LoopProduct-link woocommerce-loop-product__link"
       href="https://annifarm.com.mk/p/no-price/"></a>
  </div>
</div>
"""

APTEKA24_PAGE = """
<main><div><ul>
  <li class="product"><div class="product-content">
    <span class="yith-wcbr-brands">now foods</span>
    <a href="https://apteka24.mk/p/omega-3/">
      <h2 class="woocommerce-loop-product__title">Omega 3 1000mg</h2>
      <span class="price">
        <del><span class="amount">1,000 ден</span></del>
        <ins><span class="amount">800 ден</span></ins>
      </span>
    </a>
  </div></li>
  <li class="product"><div class="product-content">
    <a href="https://apteka24.mk/p/no-price/">
      <h2 class="woocommerce-loop-product__title">No price</h2>
      <span class="price"><span class="amount">ден</span></span>
    </a>
  </div></li>
  <li class="product"><div class="product-content">
    <a href="https://apteka24.mk/p/bundle/">
      <h2 class="woocommerce-loop-product__title">Price range bundle</h2>
      <span class="price">
        <span class="amount">500 ден</span><span>–</span><span class="amount">900 ден</span>
      </span>
    </a>
  </div></li>
</ul></div></main>
"""

VITAMINI_PAGE = """
<main>
  <div class="wd-product">
    <h3 class="wd-entities-title"><a href="https://vitamini.mk/p/magnesium/">NOW Magnesium</a></h3>
    <div class="product-wrapper"><span class="price">
      <del><span class="amount">1.200,00 ден</span></del>
      <ins><span class="amount">990,00 ден</span></ins>
    </span></div>
  </div>
  <div class="wd-product">
    <h3 class="wd-entities-title"><a href="https://vitamini.mk/p/x/">X</a></h3>
    <div class="product-wrapper"><span class="price">
      <span class="amount">700,00 ден</span>
    </span></div>
  </div>
</main>
"""

ZEGIN_PAGE = """
<ul class="search-products-grid"><li>
  <div class="product__summary">
    <h2 class="product__title">Zinc <span>25 mg</span></h2>
    <div class="product__media"><a href="products/zinc-25"></a></div>
    <div class="product__price">
      <div class="price--original">990,00 ден.</div>
      <div class="price--listed">1.200,00 ден.</div>
    </div>
  </div>
  <div class="product__summary">
    <h2 class="product__title">No price</h2>
    <div class="product__media"><a href="products/no-price"></a></div>
  </div>
</li></ul>
"""
