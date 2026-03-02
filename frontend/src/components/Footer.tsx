import { Link } from 'react-router-dom';

const email = import.meta.env.VITE_WEBSITE_EMAIL as string;
const websiteUrl = import.meta.env.VITE_WEBSITE_URL as string;

export default function Footer() {
  return (
    <footer className="bg-dark text-neutral flex h-40 flex-col items-center justify-around p-3 text-sm md:h-16 md:flex-row">
      <p>
        <Link
          to={'/about'}
          className="hover:text-accent hover:underline"
        >
          Контакт: <a href={`mailto:${email}`}>{email}</a>
        </Link>
      </p>

      <p>
        <Link
          to={'/about'}
          className="hover:text-accent hover:underline"
        >
          За нас и правна изјава
        </Link>
      </p>

      <p>
        <Link
          to={'/how-to-use'}
          className="hover:text-accent hover:underline"
        >
          Упатство за користење
        </Link>
      </p>

      <p className="hover:text-accent hover:cursor-pointer hover:underline">
        2026, <a href={websiteUrl}>{websiteUrl.replace('https://', '').replace('http://', '')}</a>
      </p>
    </footer>
  );
}
