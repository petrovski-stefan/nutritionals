export type AuthRedirectReason = 'smart-search' | 'my-lists' | 'add-to-list' | 'session-expired';

export type AuthRedirectState = {
  from?: { pathname?: string; search?: string };
  reason?: AuthRedirectReason;
};
