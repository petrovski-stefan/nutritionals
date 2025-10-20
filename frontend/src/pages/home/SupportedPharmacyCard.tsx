type Props = {
  name: string;
  homepage: string;
  logo: string;
};

export default function PharmacyCard({ name, homepage, logo }: Props) {
  return (
    <div className="border-dark/50 w-[15%] rounded-4xl border-2 bg-white px-5 py-8">
      <img
        src={logo}
        alt={name}
      ></img>
      <p className="mt-5">
        <a
          href={homepage}
          target="_blank"
          className="hover:decoration-accent hover:underline"
        >
          {name}
        </a>
      </p>
    </div>
  );
}
