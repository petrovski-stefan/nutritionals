type Props = {
  title: string;
  price: string;
  imageLink: string;
};

export default function DropdownProductCard({ title, price, imageLink }: Props) {
  // TODO: handle discounts if applicable
  return (
    <div className="flex justify-between border-b-2 px-2 py-2">
      <div className="w-[10%]">
        <img
          src={imageLink}
          alt={title}
        />
      </div>
      <div className="text-md w-[70%]">{title}</div>
      <div className="w-[10%]">{price}</div>
    </div>
  );
}
