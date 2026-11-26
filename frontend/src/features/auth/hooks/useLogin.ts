import * as UserService from '@/features/auth/api';

import useAuthMutation from './useAuthMutation';

const useLogin = (from: string) => useAuthMutation(UserService.loginUser, from);

export default useLogin;
