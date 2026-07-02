import type { ApiErrorMessages } from '../../shared/utils/flattenErrors';

export const authErrorMessages: ApiErrorMessages = {
  fallback: 'Настана грешка. Проверете ги внесените податоци.',
  field: {
    username: {
      invalid: 'Корисничкото име е недостапно.',
      unique: 'Корисничкото име е недостапно.',
      min_length: 'Корисничкото име треба да содржи најмалку 5 карактери.',
    },
    password: {
      password_too_short: 'Лозинката треба да содржи најмалку 8 карактери.',
      password_too_common: 'Лозинката е премногу честа. Одберете посилна лозинка.',
      password_entirely_numeric: 'Лозинката не може да се состои само од броеви.',
      password_too_similar: 'Лозинката е премногу слична со вашето корисничко име.',
    },
  },
  form: {
    passwords_do_not_match: 'Лозинките не се совпаѓаат.',
    no_active_account: 'Погрешно корисничко име или лозинка.',
  },
};
