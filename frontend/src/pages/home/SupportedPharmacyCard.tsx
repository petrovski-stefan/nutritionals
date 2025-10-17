import { supportedPharmacies } from '../../constants/pharmacies';

type Props = {
  name: string;
  // imageUrl: string;
  // websiteUrl: string;
};

export default function PharmacyCard({ name }: Props) {
  // TODO: get them from API
  const image = supportedPharmacies.find((name) => name === name)?.imageUrl;
  const website = supportedPharmacies.find((name) => name === name)?.websiteUrl;

  return (
    <div className="border-dark/50 w-[15%] rounded-4xl border-2 bg-white px-5 py-8">
      <img
        src={image}
        alt={name}
      ></img>
      <p className="mt-5">
        <a
          href={website}
          target="_blank"
          className="hover:decoration-accent hover:underline"
        >
          {name}
        </a>
      </p>
    </div>
  );
}
