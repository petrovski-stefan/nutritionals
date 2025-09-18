type Props = {
  title: string;
  price: string;
  brand: string;
  imageLink: string;
};

export default function ProductCard({ title, price, brand, imageLink }: Props) {
  return (
    <div className="border-dark/50 w-[15%] rounded-4xl border-2 bg-white px-5 py-8">
      <img
        src={imageLink}
        alt="product"
      />
      <p className="text-dark text-center">{title}</p>
      <p className="text-primary text-2xl font-bold">{price}</p>
      <p className="text-dark/70 text-center">{brand}</p>
    </div>
  );
}
