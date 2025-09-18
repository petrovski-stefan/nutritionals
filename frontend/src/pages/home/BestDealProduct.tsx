type Props = {
  name: string;
  oldPrice: number;
  newPrice: number;
  pharmacyName: string;
  imageUrl: string;
};

export default function BestDealsProductCard({
  name,
  oldPrice,
  newPrice,
  pharmacyName,
  imageUrl,
}: Props) {
  return (
    <div className="border-dark/50 w-[15%] rounded-4xl border-2 bg-white px-5 py-8">
      <img
        src={imageUrl}
        alt="product"
      />
      <p className="text-dark text-center">{name}</p>
      <div className="flex justify-around">
        <p className="text-dark/50 flex items-center line-through">{oldPrice}</p>
        <p className="text-primary text-2xl font-bold">{newPrice}</p>
      </div>
      <p className="text-dark/70 text-center">{pharmacyName}</p>
    </div>
  );
}
