// Router state for sending a logged-out user to sign in and back again.
// Shared because products (the star) and the router set it, and the auth feature reads it
export type AuthRedirectReason = 'smart-search' | 'my-lists' | 'add-to-list';

export type AuthRedirectState = {
  from?: { pathname?: string; search?: string };
  reason?: AuthRedirectReason;
};
