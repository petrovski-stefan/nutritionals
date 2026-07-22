import type { BackendCategory } from './categories';
import type { BackendProduct } from './products';

export type BackendProductGroup = {
  id: number;
  name: string;
  brand_name: string | null;
  categories: BackendCategory[];
  products: BackendProduct[];
};

export type GroupFilterValue = {
  brandIds: Array<number>;
  categoryIds: number[];
};

export type GroupFilterDisplay = {
  brands: boolean;
  categories: boolean;
};
