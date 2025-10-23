type Props = {
  name: string;
  price: string;
  discountPrice: string;
  pharmacyName: string;
};

export default function BestDealsProductCard({ name, price, discountPrice, pharmacyName }: Props) {
  return (
    <div className="border-dark/50 w-[15%] rounded-4xl border-2 bg-white px-5 py-8">
      {/* <img
        src={imageUrl}
        alt="product"
      /> */}
      <p className="text-dark text-center">{name}</p>
      <div className="flex justify-around">
        <p className="text-dark/50 flex items-center line-through">{price}</p>
        <p className="text-primary text-2xl font-bold">{discountPrice}</p>
      </div>
      <p className="text-dark/70 text-center">{pharmacyName}</p>
    </div>
  );
}
