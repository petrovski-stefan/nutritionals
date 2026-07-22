import { useAuthContext } from '@/context/AuthContext';
import * as MyListService from '@/features/my-lists/api';

import useMyListsMutation from './useMyListsMutation';

const useCreateMyList = () => {
  const { accessToken } = useAuthContext();

  return useMyListsMutation((variables: { name: string }) =>
    MyListService.createMyList(variables.name, accessToken)
  );
};

export default useCreateMyList;
