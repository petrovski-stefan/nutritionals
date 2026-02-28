export type Error = {
  search: null | 'unexpectedError' | 'noProductsFoundError';
  productToMyList: null | 'unexpectedError' | 'client_error';
  myLists: null | 'unexpectedError';
  createNewMyList: null | 'unexpectedError' | 'myListNameAlreadyUsed';
  categories: null | 'unexpectedError';
  pharmacies: null | 'unexpectedError';
};

export type IsLoading = {
  search: boolean;
  productToMyList: boolean;
  myLists: boolean;
  createNewMyList: boolean;
  categories: boolean;
  pharmacies: boolean;
};
