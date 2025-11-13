export type BackendBrand = {
  id: number;
  name: string;
};

export type BackendBrandWithProductCount = BackendBrand & {
  products_by_brand_count: number;
};
