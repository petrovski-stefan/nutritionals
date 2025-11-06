const EMAIL_CONTACT = import.meta.env.VITE_NUTRITIONALS_EMAIL as string;

export default function Footer() {
  return (
    <footer className="bg-dark text-neutral flex h-[8vh] items-center">
      <p className="w-full text-center text-sm">
        This site is a bachelor's thesis project for educational purposes. No products are sold
        here. For legal inquiries or data removal requests, contact{' '}
        <a
          href={`mailto:${EMAIL_CONTACT}`}
          className="text-accent hover:text-accent/90 underline"
        >
          {EMAIL_CONTACT}
        </a>
        . See our{' '}
        <a
          href="/about"
          className="text-accent hover:text-accent/90 underline"
        >
          About & Legal
        </a>{' '}
        page for full disclaimer.
      </p>
    </footer>
  );
}
