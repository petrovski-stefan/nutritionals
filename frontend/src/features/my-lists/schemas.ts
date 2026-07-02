import * as z from 'zod';

import MYLISTS_TEXT from './locale';

export const buildMyListNameSchema = (existingNames: string[]) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, { error: MYLISTS_TEXT['modal']['myListNameRequired'] })
      .max(30, { error: MYLISTS_TEXT['modal']['myListNameTooLong'] })
      .refine((name) => !existingNames.includes(name), {
        error: MYLISTS_TEXT['modal']['myListNameAlreadyUsed'],
      }),
  });

export type MyListNameFormFields = z.infer<ReturnType<typeof buildMyListNameSchema>>;
