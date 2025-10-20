import { Star } from 'lucide-react';

type Props = {
  name: string;
  price: string;
  brand: string;
  pharmacy: string;
  pharmacyLogo: string;
  url: string;
  updated_at: string;
};

export default function ProductCard({
  name,
  price,
  brand,
  pharmacy,
  pharmacyLogo,
  url,
  updated_at,
}: Props) {
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

      <p className="text-dark m-0 flex h-16 items-center text-left text-lg">{name}</p>
      <p className="text-primary flex h-[20%] items-center text-2xl font-bold">
        {price.slice(0, 10)}
      </p>
      <p className="text-dark/70 text-sm">
        {brand || <span className="opacity-0">Placeholder</span>}
      </p>

      <p className="hover:text-accent text-xs italic">
        <a
          href={url}
          target="_blank"
        >
          🔗 View more on {pharmacy}'s website...
        </a>
      </p>
      <p className="text-sm">Last updated: {new Date(updated_at).toDateString()}</p>
    </div>
  );
}
