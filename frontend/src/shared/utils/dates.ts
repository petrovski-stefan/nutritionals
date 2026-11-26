const padTwo = (value: number) => String(value).padStart(2, '0');

// Macedonian short date, e.g. "26.11.2026". Built by hand because Chrome ships no
// Macedonian locale data: Intl with 'mk-MK' silently falls back to en-US ("11/26/2026")
export const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);

  return `${padTwo(date.getDate())}.${padTwo(date.getMonth() + 1)}.${String(date.getFullYear())}`;
};

export const checkIsPossiblyUnavailable = (lastScrapedAtDate: Date) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1_000);

  return lastScrapedAtDate < sevenDaysAgo;
};
