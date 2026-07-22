export const myListKeys = {
  all: ['mylists'] as const,
  // Known tradeoff: token in the list key goes away once auth moves to cookies
  list: (accessToken: string) => [...myListKeys.all, accessToken] as const,
  detail: (myListId: number | null) => [...myListKeys.all, 'detail', myListId] as const,
};
