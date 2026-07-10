import { Link } from 'react-router-dom';

const email = import.meta.env['VITE_WEBSITE_EMAIL'] as string;
const websiteUrl = import.meta.env['VITE_WEBSITE_URL'] as string;

const LINK_CLASSES =
  'hover:text-accent focus-visible:outline-primary rounded transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2';

export default function Footer() {
  return (
    <footer className="border-border bg-surface-sunken text-text-muted border-t text-sm">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-6 sm:px-6 md:justify-between">
        <p>
          <a
            className={LINK_CLASSES}
            href={`mailto:${email}`}
          >
            Контакт: {email}
          </a>
        </p>

        <p>
          <Link
            to={'/about'}
            className={LINK_CLASSES}
          >
            За нас и правна изјава
          </Link>
        </p>

        <p>
          <Link
            to={'/how-to-use'}
            className={LINK_CLASSES}
          >
            Упатство за користење
          </Link>
        </p>

        <p>
          2026,{' '}
          <a
            href={websiteUrl}
            className={LINK_CLASSES}
          >
            {websiteUrl.replace('https://', '').replace('http://', '')}
          </a>
        </p>
      </div>
    </footer>
  );
}
