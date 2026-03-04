export type RequiredMyListsModalError = {
  createNewMyList: null | 'unexpectedError' | 'myListNameAlreadyUsed';
  myLists: null | 'unexpectedError';
  productToMyList: null | 'client_error' | 'unexpectedError';
};

export type RequiredMyListsModalIsLoading = {
  createNewMyList: boolean;
  myLists: boolean;
  productToMyList: boolean;
};
