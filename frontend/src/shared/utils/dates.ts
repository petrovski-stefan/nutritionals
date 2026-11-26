// Macedonian short date, e.g. "26.11.2026 г."
const DATE_FORMAT = new Intl.DateTimeFormat('mk-MK');

export const formatDate = (isoDate: string) => DATE_FORMAT.format(new Date(isoDate));

export const checkIsPossiblyUnavailable = (lastScrapedAtDate: Date) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1_000);

  return lastScrapedAtDate < sevenDaysAgo;
};
