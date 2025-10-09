import { Star } from 'lucide-react';
import { PHARMACY_TO_LOGO_MAP, INVERTED_PHARMACY_MAP } from '../../constants/pharmacies';

type Props = {
  title: string;
  price: string;
  brand: string;
  pharmacy: string;
};

export default function ProductCard({ title, price, brand, pharmacy }: Props) {
  const pharmacyLogo = PHARMACY_TO_LOGO_MAP[pharmacy as keyof typeof PHARMACY_TO_LOGO_MAP];
  const pharmacyNameFormatted =
    INVERTED_PHARMACY_MAP[pharmacy as keyof typeof INVERTED_PHARMACY_MAP];

  return (
    <div className="border-dark/50 flex h-[20rem] w-[20%] flex-col justify-around gap-2 rounded-4xl border-2 bg-white px-5 py-9">
      <div className="mx-auto flex max-h-[50%] w-[80%] justify-between">
        <div className="mb-5 w-[60%]">
          <img
            src={pharmacyLogo}
            alt="pharmacy-logo"
          />
        </div>
        <div className="flex w-[45%] justify-end">
          <span className="cursor-pointer hover:text-yellow-500">
            <Star
              fill="currentColor"
              className="h-6 w-6"
            />
          </span>
        </div>
      </div>

      <p className="text-dark m-0 flex h-16 items-center text-left text-lg">{title}</p>
      <p className="text-primary flex h-[20%] items-center text-2xl font-bold">
        {price.slice(0, 10)}
      </p>
      <p className="text-dark/70 text-sm">
        {brand || <span className="opacity-0">Placeholder</span>}
      </p>

      <p className="hover:text-accent text-xs italic">
        <a
          href=""
          target="_blank"
        >
          🔗 View more on {pharmacyNameFormatted}'s website...
        </a>
      </p>
    </div>
  );
}
