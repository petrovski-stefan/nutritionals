export const checkIsPossiblyUnavailible = (lastScrapedAtDate: Date) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1_000);

  return lastScrapedAtDate < sevenDaysAgo;
};
