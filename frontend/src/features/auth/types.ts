import * as z from 'zod';

import type { LoginSchema, RegisterFormSchema } from './schemas';

export type LoginFormFields = z.infer<typeof LoginSchema>;

export type RegisterFormFields = z.infer<typeof RegisterFormSchema>;

export type BackendTokenPair = {
  access: string;
  refresh: string;
};

export type BackendRegisterResponse = { username: string } & BackendTokenPair;
