export type BackendProduct = {
  id: number;
  name: string;
  brand: string;
  price: string;
  pharmacy: string;
  pharmacy_logo: string;
  url: string;
  updated_at: string;
};

export type BackendBrand = {
  id: number;
  name: string;
  products_by_brand_count: number;
};

export type BackendPharmacy = {
  id: number;
  name: string;
  homepage: string;
  logo: string;
};

export type ProductFiltersValues = {
  pharmacyIds: Array<number>;
  brandIds: Array<number>;
};

export type ProductFiltersDisplay = {
  pharmacies: boolean;
  brands: boolean;
};

export type ProductListQueryParams = {
  brandIds?: Array<number>;
  pharmacyIds?: Array<number>;
  searchQueryParam?: string;
};
