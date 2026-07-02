import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

import { useAuthContext } from '../../../context/AuthContext';
import type { APIResponseFailV2 } from '../../../shared/types/api';
import type { BackendTokenPair } from '../types';

const useAuthMutation = <TVariables extends { username: string }, TData extends BackendTokenPair>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  from: string
) => {
  const navigate = useNavigate();
  const { login } = useAuthContext();

  return useMutation<TData, AxiosError<APIResponseFailV2>, TVariables>({
    mutationFn,

    onSuccess(data, variables) {
      login(variables.username, data.access);
      void navigate(from, { replace: true });
    },
  });
};

export default useAuthMutation;
