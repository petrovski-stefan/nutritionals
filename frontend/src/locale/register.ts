const TEXT = {
  form: {
    username: 'Корисничко име',
    usernamePlaceholder: 'Внесете корисничко име со мин. 5 карактери',
    password: 'Лозинка',
    passwordPlaceholder: 'Внесете лозинка со мин. 8 карактери',
    repeatPassword: 'Повторете ја лозинката',
    repeatPasswordPlaceholder: 'Повторете ја лозинката',
    registerButton: 'Регистрирај се',
    registerButtonLoading: 'Ве молиме почекајте ...',
  },
  errors: {
    // frontend
    unexpectedError: 'Се случи неочекувана грешка. Обидете се повторно.',
    requiredFieldsEmptyError: 'Сите полиња се задолжителни.',
    passwordsDoNotMatchError: 'Лозинките не се совпаѓаат.',
    weakPasswordError:
      'Лозинката треба да содржи најмалку 8 карактери и најмалку еден специјален знак . , ! ? @ #',
    // backend
    validation_error: 'Корисничкото име не е достапно во моментот.',
  },
  hasAccount: 'Имате отворено корисничка сметка? ',
  loginLink: 'Најавете се',
};

export default TEXT;
