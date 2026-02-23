export type BackendMyListItem = {
  id: number;
  is_added_through_smart_search: boolean;
  product_id: number;
  product_name: string;
  product_price: number;
  product_discount_price: number | null;
  product_discount_percent: number | null;
  product_last_scraped_at: string;
  product_url: string;
  product_brand_name: string | null;
  product_pharmacy_name: string;
  created_at: string;
  updated_at: string;
};

export type BaseBackendMyList = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
};

export type BackendMyListWithItemsCount = BaseBackendMyList & {
  items_count: number;
};

export type BackendMyListWithItems = BaseBackendMyList & {
  items: BackendMyListItem[];
};

export type ProductToMyList = {
  productId: number;
  productName: string;
  pharmacyName: string;
};
