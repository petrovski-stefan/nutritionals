import * as z from 'zod';

// Product search (Home and Compare). 2, not 3: names like "D3", "B6" and "K2" are two characters
export const MIN_SEARCH_QUERY_LENGTH = 2;

// Product-groups API `ordering`: lowest current price first, best discount first.
// Absent means the default order (best match when searching, otherwise most offers)
const GROUP_ORDERINGS = ['price', 'discount'] as const;
export type GroupOrdering = (typeof GROUP_ORDERINGS)[number];
export const toGroupOrdering = (value: string | null): GroupOrdering | null =>
  GROUP_ORDERINGS.find((ordering) => ordering === value) ?? null;

export const SmartSearchSchema = z.object({
  query: z
    .string()
    .trim()
    .min(3, { error: 'Внесете барање со најмалку 3 карактери.' })
    .max(100, { error: 'Барањето може да содржи најмногу 100 карактери.' }),
});

export type SmartSearchFormFields = z.infer<typeof SmartSearchSchema>;
