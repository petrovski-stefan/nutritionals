export type Error = {
  groups: null | 'unexpectedError' | 'noProductsFoundError';
  productToMyList: null | 'client_error' | 'unexpectedError';
  myLists: null | 'unexpectedError';
  createNewMyList: null | 'unexpectedError' | 'myListNameAlreadyUsed';
  categories: null | 'unexpectedError';
  brands: null | 'unexpectedError';
};

export type IsLoading = {
  groups: boolean;
  productToMyList: boolean;
  myLists: boolean;
  createNewMyList: boolean;
  categories: boolean;
  brands: boolean;
};
