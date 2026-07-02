import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { APIBaseError } from '../../../shared/types/api';
import { myListKeys } from '../queries';

const useMyListsMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  onSuccessSideEffect?: (variables: TVariables) => void
) => {
  const queryClient = useQueryClient();

  return useMutation<TData, APIBaseError, TVariables>({
    mutationFn,

    onSuccess(_data, variables) {
      onSuccessSideEffect?.(variables);
      // Prefix key: invalidates the list and every detail query
      void queryClient.invalidateQueries({ queryKey: myListKeys.all });
    },
  });
};

export default useMyListsMutation;
