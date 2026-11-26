import type { BackendDiscountedCategory } from '@/features/products/types/productgroups';

type Props = Readonly<{
  categories: BackendDiscountedCategory[];
  selectedCategoryId: number | null;
  onSelect: (categoryId: number | null) => void;
}>;

const CHIP_BASE_CLASSES =
  'focus-visible:outline-primary shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm pointer-coarse:py-2.5 font-medium transition duration-150 ease-out focus-visible:outline-2 active:scale-95 motion-reduce:transition-none focus-visible:outline-offset-2';

const getChipClasses = (isSelected: boolean) =>
  isSelected
    ? `${CHIP_BASE_CLASSES} border-primary bg-primary/10 text-primary`
    : `${CHIP_BASE_CLASSES} border-border text-text-muted hover:border-primary hover:text-primary`;

export default function CategoryChips({ categories, selectedCategoryId, onSelect }: Props) {
  if (categories.length === 0) {
    return null;
  }

  return (
    // py-1 leaves room for the focus ring inside the scrolling row
    <div className="mb-6 flex gap-2 overflow-x-auto py-1 max-sm:-mx-4 max-sm:px-4 sm:flex-wrap sm:justify-center sm:overflow-visible">
      <button
        type="button"
        aria-pressed={selectedCategoryId === null}
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
          aria-pressed={selectedCategoryId === category.id}
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
