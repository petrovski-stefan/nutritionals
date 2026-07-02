import { useAuthContext } from '../../../context/AuthContext';
import * as MyListService from '../api';
import useMyListsMutation from './useMyListsMutation';

const useAddProductToMyList = () => {
  const { accessToken } = useAuthContext();

  return useMyListsMutation(
    (variables: { myListId: number; productId: number; isAddedThroughSmartSearch?: boolean }) =>
      MyListService.addProductToMyList(
        variables.myListId,
        variables.productId,
        accessToken,
        variables.isAddedThroughSmartSearch ?? false
      )
  );
};

export default useAddProductToMyList;
