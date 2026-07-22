import * as z from 'zod';

export const SmartSearchSchema = z.object({
  query: z
    .string()
    .trim()
    .min(3, { error: 'Внесете барање со најмалку 3 карактери.' })
    .max(100, { error: 'Барањето може да содржи најмногу 100 карактери.' }),
});

export type SmartSearchFormFields = z.infer<typeof SmartSearchSchema>;
