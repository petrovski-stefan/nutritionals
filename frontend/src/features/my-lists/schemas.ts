import * as z from 'zod';

export const buildMyListNameSchema = (existingNames: string[]) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, { error: 'Внесете име на листата.' })
      .max(30, { error: 'Името на листата може да содржи најмногу 30 карактери.' })
      .refine((name) => !existingNames.includes(name), {
        error: 'Веќе имате креирано листа со внесеното име.',
      }),
  });

export type MyListNameFormFields = z.infer<ReturnType<typeof buildMyListNameSchema>>;
