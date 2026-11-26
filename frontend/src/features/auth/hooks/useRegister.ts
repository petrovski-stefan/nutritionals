import * as UserService from '@/features/auth/api';

import useAuthMutation from './useAuthMutation';

const useRegister = (from: string) => useAuthMutation(UserService.registerUser, from);

export default useRegister;
