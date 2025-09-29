export type BackendProduct = {
  id: number;
  title: string;
  brand: string;
  price: string;
  image_link: string;
  pharmacy: string;
};

export type BackendProductBrand = {
  brand: string;
  products_by_brand_count: number;
};

export type ProductFilters = {
  pharmacies: Array<string>;
  brands: Array<string>;
};

export type GetProductsInput = {
  brands?: Array<string>;
  pharmacies?: Array<string>;
  searchQueryParam?: string;
};
