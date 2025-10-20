type Props = {
  name: string;
  price: string;
  pharmacyLogo: string;
};

export default function DropdownProductCard({ name, price, pharmacyLogo }: Props) {
  // TODO: handle discounts if applicable

  return (
    <div className="flex justify-between border-b-2 px-2 py-2">
      <div className="w-[10%]">
        <img
          src={pharmacyLogo}
          alt={name}
        />
      </div>
      <div className="text-md w-[70%]">{name}</div>
      <div className="w-[10%]">{price}</div>
    </div>
  );
}
