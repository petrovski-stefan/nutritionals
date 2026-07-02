import * as z from 'zod';

import SMART_SEARCH_TEXT from './locale/smart-search';

export const SmartSearchSchema = z.object({
  query: z
    .string()
    .trim()
    .min(3, { error: SMART_SEARCH_TEXT['form']['queryTooShort'] })
    .max(100, { error: SMART_SEARCH_TEXT['form']['queryTooLong'] }),
});

export type SmartSearchFormFields = z.infer<typeof SmartSearchSchema>;
