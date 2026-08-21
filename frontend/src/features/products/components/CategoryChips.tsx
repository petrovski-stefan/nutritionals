import type { BackendDiscountedCategory } from '@/features/products/types/productgroups';

type Props = Readonly<{
  categories: BackendDiscountedCategory[];
  selectedCategoryId: number | null;
  onSelect: (categoryId: number | null) => void;
}>;

const CHIP_BASE_CLASSES =
  'focus-visible:outline-primary rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2';

const getChipClasses = (isSelected: boolean) =>
  isSelected
    ? `${CHIP_BASE_CLASSES} border-primary bg-primary/10 text-primary`
    : `${CHIP_BASE_CLASSES} border-border text-text-muted hover:border-primary hover:text-primary hover:cursor-pointer`;

export default function CategoryChips({ categories, selectedCategoryId, onSelect }: Props) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 flex flex-wrap justify-center gap-2">
      <button
        type="button"
        className={getChipClasses(selectedCategoryId === null)}
        onClick={() => {
          onSelect(null);
        }}
      >
        Сите
      </button>

      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          className={getChipClasses(selectedCategoryId === category.id)}
          onClick={() => {
            onSelect(category.id);
          }}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
