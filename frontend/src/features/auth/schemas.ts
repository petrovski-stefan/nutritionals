import * as z from 'zod';

import { GLOBAL_ZOD_FORM_ERROR_KEY } from '@/shared/utils/flattenErrors';

export const LoginSchema = z.object({
  username: z.string().min(5, { error: 'Корисничкото име треба да содржи најмалку 5 карактери' }),
  password: z.string().min(8, { error: 'Лозинката треба да содржи најмалку 8 карактери' }),
});

export const RegisterFormSchema = z
  .object({
    username: z.string().min(5, { error: 'Корисничкото име треба да содржи најмалку 5 карактери' }),
    password: z
      .string()
      .min(8, { error: 'Лозинката треба да содржи најмалку 8 карактери' })
      .regex(/[A-Z]/, {
        error: 'Лозинката треба да содржи најмалку една голема буква',
      })
      .regex(/\d/, { error: 'Лозинката треба да содржи најмалку една цифра' }),
    confirmPassword: z.string().min(8, { error: 'Лозинката треба да содржи најмалку 8 карактери' }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    error: 'Лозинките не се совпаѓаат',
    path: [GLOBAL_ZOD_FORM_ERROR_KEY],
  });
