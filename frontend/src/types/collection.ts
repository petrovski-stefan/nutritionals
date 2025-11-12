import type { BackendProduct } from './product';

export type ProductInCollection = Omit<BackendProduct, 'pharmacy' | 'brand' | 'url'>;

export type BackendCollection = {
  id: number;
  name: string;
  products: Array<ProductInCollection>;
};
