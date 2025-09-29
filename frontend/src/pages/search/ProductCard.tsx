import { Star } from 'lucide-react';
import { INVERTED_PHARMACY_MAP } from './constants';

type Props = {
  title: string;
  price: string;
  brand: string;
  imageLink: string;
  pharmacy: string;
};

export default function ProductCard({ title, price, brand, imageLink, pharmacy }: Props) {
  return (
    <div className="border-dark/50 flex w-[15%] flex-col justify-around gap-2 rounded-4xl border-2 bg-white px-5 py-8">
      <div className="mx-auto flex max-h-[50%] w-[80%] items-center">
        <img
          src={imageLink}
          alt="product"
        />
      </div>

      <p className="text-dark text-center text-sm">{title}</p>
      <p className="text-primary text-center text-2xl font-bold">{price.slice(0, 10)}</p>
      <p className="text-dark/70 text-center text-sm">{brand}</p>

      <div className="flex w-full items-center justify-around">
        <span className="cursor-pointer hover:text-yellow-500">
          <Star
            fill="currentColor"
            className="h-6 w-6"
          />
        </span>
        <p className="text-sm">
          {INVERTED_PHARMACY_MAP[pharmacy as keyof typeof INVERTED_PHARMACY_MAP]}
        </p>
      </div>
    </div>
  );
}
