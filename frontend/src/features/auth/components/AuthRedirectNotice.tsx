import { InfoIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import type { AuthRedirectReason, AuthRedirectState } from '@/shared/types/navigation';

// Worded for both sign-in and registration, since the reason travels between the two pages
const MESSAGES: Record<AuthRedirectReason, string> = {
  'smart-search': 'Паметното пребарување е достапно за најавени корисници.',
  'my-lists': 'Листите се достапни за најавени корисници.',
  'add-to-list': 'Зачувувањето суплементи во листа е достапно за најавени корисници.',
  'session-expired': 'Вашата сесија истече. Најавете се повторно за да продолжите.',
};

// Tells a user who was redirected here why they need an account
export default function AuthRedirectNotice() {
  const location = useLocation();
  const reason = (location.state as AuthRedirectState | null)?.reason;

  if (!reason) return null;

  return (
    <p className="bg-info/10 text-info mb-5 flex items-start gap-2 rounded-xl px-3 py-2 text-sm">
      <InfoIcon
        aria-hidden="true"
        className="mt-0.5 h-4 w-4 shrink-0"
      />
      {MESSAGES[reason]}
    </p>
  );
}
