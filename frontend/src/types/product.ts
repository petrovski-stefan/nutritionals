export type BackendProduct = {
  id: number;
  name: string;
  brand: string;
  price: string;
  discount_price: string;
  pharmacy: string;
  pharmacy_logo: string;
  url: string;
  updated_at: string;
};

export type ProductFiltersValues = {
  pharmacyIds: Array<number>;
  brandIds: Array<number>;
  discount: boolean;
};

export type ProductFiltersDisplay = {
  pharmacies: boolean;
  brands: boolean;
  discount: boolean;
};

export type ProductListQueryParams = {
  brandIds?: Array<number>;
  pharmacyIds?: Array<number>;
  discount?: boolean;
  searchQueryParam?: string;
};
