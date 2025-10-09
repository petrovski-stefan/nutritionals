import { PHARMACY_TO_LOGO_MAP } from '../../constants/pharmacies';

type Props = {
  title: string;
  price: string;
  pharmacy: string;
};

export default function DropdownProductCard({ title, price, pharmacy }: Props) {
  const pharmacyLogo = PHARMACY_TO_LOGO_MAP[pharmacy as keyof typeof PHARMACY_TO_LOGO_MAP];
  // TODO: handle discounts if applicable

  return (
    <div className="flex justify-between border-b-2 px-2 py-2">
      <div className="w-[10%]">
        <img
          src={pharmacyLogo}
          alt={title}
        />
      </div>
      <div className="text-md w-[70%]">{title}</div>
      <div className="w-[10%]">{price}</div>
    </div>
  );
}
