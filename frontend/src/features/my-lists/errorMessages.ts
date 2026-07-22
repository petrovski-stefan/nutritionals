import type { ApiErrorMessages } from '@/shared/utils/flattenErrors';

export const myListsErrorMessages: ApiErrorMessages = {
  fallback: 'Се случи неочекувана грешка.',
  field: {
    name: {
      blank: 'Внесете име на листата.',
      max_length: 'Името на листата може да содржи најмногу 30 карактери.',
    },
  },
  form: {
    unique_together_name_user: 'Веќе имате креирано листа со внесеното име.',
    unique_together_product_mylist: 'Суплементот веќе е додаден во листата.',
  },
};
