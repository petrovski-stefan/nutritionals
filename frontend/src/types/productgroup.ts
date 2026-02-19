import type { BackendCategory } from './category';
import type { BackendProduct } from './product';

export type BackendProductGroup = {
  id: number;
  name: string;
  brand_name: string;
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
