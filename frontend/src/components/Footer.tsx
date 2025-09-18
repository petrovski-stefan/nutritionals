const EMAIL_CONTACT = 'stefanpetrovski345@gmail.com';

export default function Footer() {
  return (
    <div className="bg-dark text-neutral flex h-[8vh] items-center">
      <p className="w-full text-center text-sm">
        This site is a bachelor's thesis project and not a commercial service. Products are not sold
        here; data and images are shown for educational purposes only — contact me at{' '}
        <a
          href={`mailto:${EMAIL_CONTACT}`}
          className="text-secondary hover:text-secondary/90 underline"
        >
          {EMAIL_CONTACT}
        </a>{' '}
        for data removal.
      </p>
    </div>
  );
}
