import type { BackendCategory } from './categories';
import type { BackendProduct } from './products';

export type BackendProductGroup = {
  id: number;
  name: string;
  brand_name: string | null;
  categories: BackendCategory[];
  products: BackendProduct[];
};

export type BackendDiscountedProductGroup = Omit<BackendProductGroup, 'categories'> & {
  best_discount_percent: number;
  lowest_price: number;
  offer_count: number;
};

export type BackendDiscountedCategory = BackendCategory & {
  group_count: number;
};

export type BackendDiscountedGroups = {
  categories: BackendDiscountedCategory[];
  results: BackendDiscountedProductGroup[];
};

export type GroupFilterValue = {
  brandIds: Array<number>;
  categoryIds: number[];
};

export type GroupFilterDisplay = {
  brands: boolean;
  categories: boolean;
};
