import { Link } from 'react-router-dom';
import FOOTER_TEXT from '../locale/footer';

export default function Footer() {
  return (
    <footer className="bg-dark text-neutral flex h-32 items-center md:h-16">
      <p className="w-full text-center text-sm">
        {FOOTER_TEXT['p']}
        <Link
          className="text-accent hover:decoration-accent hover:underline"
          to={'/about'}
        >
          {FOOTER_TEXT['about']}
        </Link>
        {FOOTER_TEXT['dot']}
      </p>
    </footer>
  );
}
