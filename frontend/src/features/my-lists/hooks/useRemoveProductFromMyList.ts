import { useAuthContext } from '../../../context/AuthContext';
import * as MyListService from '../api';
import useMyListsMutation from './useMyListsMutation';

const useRemoveProductFromMyList = () => {
  const { accessToken } = useAuthContext();

  return useMyListsMutation((variables: { myListId: number; productId: number }) =>
    MyListService.removeProductFromMyList(variables.myListId, variables.productId, accessToken)
  );
};

export default useRemoveProductFromMyList;
