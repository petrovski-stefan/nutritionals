import { useQueryClient } from '@tanstack/react-query';

import { useAuthContext } from '../../../context/AuthContext';
import * as MyListService from '../api';
import { myListKeys } from '../queries';
import useMyListsMutation from './useMyListsMutation';

const useDeleteMyList = () => {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthContext();

  return useMyListsMutation(
    (variables: { myListId: number }) =>
      MyListService.deleteMyList(variables.myListId, accessToken),
    (variables) => {
      // Drops the deleted list's detail query from the cache
      queryClient.removeQueries({ queryKey: myListKeys.detail(variables.myListId) });
    }
  );
};

export default useDeleteMyList;
