import { queryOptions, skipToken, useQuery } from '@tanstack/react-query';

import { useAuthContext } from '../../../context/AuthContext';
import * as MyListService from '../api';
import { myListKeys } from '../queries';

const useMyList = (myListId: number | null) => {
  const { accessToken } = useAuthContext();

  // eslint-disable-next-line @tanstack/query/exhaustive-deps -- the token is auth plumbing, not part of the query identity
  const options = queryOptions({
    queryKey: myListKeys.detail(myListId),
    queryFn:
      myListId === null || !accessToken
        ? skipToken
        : () => MyListService.getMyListById(myListId, accessToken),
  });

  return useQuery(options);
};

export default useMyList;
