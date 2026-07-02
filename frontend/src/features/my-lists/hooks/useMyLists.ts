import { queryOptions, useQuery } from '@tanstack/react-query';

import * as MyListService from '../api';
import { myListKeys } from '../queries';

const useMyLists = (accessToken: string) => {
  const options = queryOptions({
    queryKey: myListKeys.list(accessToken),
    queryFn: () => MyListService.getMyLists(accessToken),
    enabled: !!accessToken,
  });

  return useQuery(options);
};

export default useMyLists;
