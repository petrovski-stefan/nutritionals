import Chip from '@/components/ui/Chip';
import type { BackendDiscountedCategory } from '@/features/products/types/productgroups';

type Props = Readonly<{
  categories: BackendDiscountedCategory[];
  selectedCategoryId: number | null;
  onSelect: (categoryId: number | null) => void;
}>;

export default function CategoryChips({ categories, selectedCategoryId, onSelect }: Props) {
  if (categories.length === 0) {
    return null;
  }

  return (
    // py-1 leaves room for the focus ring inside the scrolling row
    <div className="mb-6 flex gap-2 overflow-x-auto py-1 max-sm:-mx-4 max-sm:px-4 sm:flex-wrap sm:justify-center sm:overflow-visible">
      <Chip
        isSelected={selectedCategoryId === null}
        onClick={() => {
          onSelect(null);
        }}
      >
        Сите
      </Chip>

      {categories.map((category) => (
        <Chip
          key={category.id}
          isSelected={selectedCategoryId === category.id}
          onClick={() => {
            onSelect(category.id);
          }}
        >
          {category.name}
        </Chip>
      ))}
    </div>
  );
}
