type Props = {
  name: string;
  homepage: string;
  logo: string;
};

export default function SupportedPharmacyCard({ name, homepage, logo }: Props) {
  return (
    <div className="border-dark/50 relative flex w-[15%] min-w-[180px] flex-col items-center gap-4 rounded-4xl border-2 bg-white p-5 transition-transform hover:scale-105 hover:shadow-lg">
      {/* Pharmacy Logo */}
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-neutral-100 p-4 shadow-inner">
        <img
          src={logo}
          alt={name}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {/* Pharmacy Name */}
      <p className="text-dark text-center text-lg font-semibold">
        <a
          href={homepage}
          target="_blank"
          className="hover:decoration-accent hover:underline"
          rel="noopener noreferrer"
        >
          {name}
        </a>
      </p>
    </div>
  );
}
