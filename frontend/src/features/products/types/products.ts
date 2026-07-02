export type BackendProduct = {
  id: number;
  name: string;
  price: number;
  discount_price: number | null;
  discount_percent?: number;
  pharmacy_name: string;
  brand_name: string | null;
  url: string;
  last_scraped_at: string;
};

export type BackendDiscountedProduct = BackendProduct & {
  discount_price: number;
  discount_percent: number;
};
