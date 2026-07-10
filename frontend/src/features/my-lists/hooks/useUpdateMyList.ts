import { useAuthContext } from '@/context/AuthContext';
import * as MyListService from '@/features/my-lists/api';

import useMyListsMutation from './useMyListsMutation';

const useUpdateMyList = () => {
  const { accessToken } = useAuthContext();

  return useMyListsMutation((variables: { myListId: number; name: string }) =>
    MyListService.updateMyList(variables.myListId, variables.name, accessToken)
  );
};

export default useUpdateMyList;
