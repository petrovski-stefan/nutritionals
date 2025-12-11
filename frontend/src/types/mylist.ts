export type BackendMyListItem = {
  id: number;
  is_added_through_smart_search: boolean;
  product_id: number;
  product_name: string;
  product_price: string;
  product_discount_price: string;
  product_updated_at: string;
  product_url: string;
  product_brand_name: string | null;
  pharmacy_logo: string;
  created_at: string;
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
  id: number;
  name: string;
};
