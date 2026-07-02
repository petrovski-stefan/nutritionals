import type { ApiErrorMessages } from '../../shared/utils/flattenErrors';
import MYLISTS_TEXT from './locale';

export const myListsErrorMessages: ApiErrorMessages = {
  fallback: MYLISTS_TEXT['modal']['unexpectedError'],
  field: {
    name: {
      blank: MYLISTS_TEXT['modal']['myListNameRequired'],
      max_length: MYLISTS_TEXT['modal']['myListNameTooLong'],
    },
  },
  form: {
    unique_together_name_user: MYLISTS_TEXT['modal']['myListNameAlreadyUsed'],
    unique_together_product_mylist: 'Суплементот веќе е додаден во листата.',
  },
};
