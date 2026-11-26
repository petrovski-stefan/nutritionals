import { useQueryClient } from '@tanstack/react-query';

import { useAuthContext } from '@/context/AuthContext';
import * as MyListService from '@/features/my-lists/api';
import { myListKeys } from '@/features/my-lists/queries';

import useMyListsMutation from './useMyListsMutation';

const useDeleteMyList = () => {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthContext();

  return useMyListsMutation(
    (variables: { myListId: number }) =>
      MyListService.deleteMyList(variables.myListId, accessToken),
    (variables) => {
      queryClient.removeQueries({ queryKey: myListKeys.detail(variables.myListId) });
    }
  );
};

export default useDeleteMyList;
