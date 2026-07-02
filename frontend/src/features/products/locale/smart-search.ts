const TEXT = {
  hero: {
    h1: 'Опишете ја вашата цел, а паметниот асистент ќе ги пронајде најдобрите суплементи за вас.',
  },
  form: {
    placeholder: 'Опишете ја вашата цел ... (пр., посилен имунитет)',
    unexpectedError: 'Се случи неочекувана грешка.',
    loading: 'Се вчитува ...',
    queryTooShort: 'Внесете барање со најмалку 3 карактери.',
    queryTooLong: 'Барањето може да содржи најмногу 100 карактери.',
  },
  searchResultsModal: {
    productsFound: (query: string, productsLength: number) =>
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `Паметниот асистент пронајде ${productsLength} суплементи за вашето барање: "${query}".`,
    noProductsFound: (query: string) =>
      `Паметниот асистент не пронајде суплементи за вашето барање "${query}". Обидете се повторно.`,
  },
  warning: {
    h1: 'Оваа функционалност е само за информативни цели и не дијагностицира ниту лекува медицински состојби. Секогаш консултирајте се со здравствен работник пред да започнете со употреба на каков било суплемент.',
  },
};

export default TEXT;
