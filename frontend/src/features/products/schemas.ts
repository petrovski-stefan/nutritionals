import * as z from 'zod';

// Product search (Home and Compare). 2, not 3: names like "D3", "B6" and "K2" are two characters
export const MIN_SEARCH_QUERY_LENGTH = 2;

export const SmartSearchSchema = z.object({
  query: z
    .string()
    .trim()
    .min(3, { error: 'Внесете барање со најмалку 3 карактери.' })
    .max(100, { error: 'Барањето може да содржи најмногу 100 карактери.' }),
});

export type SmartSearchFormFields = z.infer<typeof SmartSearchSchema>;
