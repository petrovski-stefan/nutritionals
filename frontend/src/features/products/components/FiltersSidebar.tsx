import { SearchIcon, XIcon } from 'lucide-react';
import { type FormEvent, type ReactNode, useState } from 'react';

import Card from '@/components/ui/Card';
import Checkbox from '@/components/ui/Checkbox';
import IconButton from '@/components/ui/IconButton';
import Input from '@/components/ui/Input';
import RetryButton from '@/components/ui/RetryButton';
import Skeleton from '@/components/ui/Skeleton';
import StateMessage from '@/components/ui/StateMessage';
import Tooltip from '@/components/ui/Tooltip';
import useBrands from '@/features/products/hooks/useBrands';
import useCategories from '@/features/products/hooks/useCategories';
import type { GroupFilterDisplay, GroupFilterValue } from '@/features/products/types/productgroups';

import CheckboxesFilter from './CheckboxesFilter';

type Props = Readonly<{
  inputSearchQuery: string;
  setInputSearchQuery: (value: string) => void;
  handleSearchFormSubmit: (e: FormEvent) => void;

  handleFilterValueChange: (key: keyof GroupFilterValue, value: number, isChecked: boolean) => void;
  handleClearInputSearchQuery: () => void;
  filters: GroupFilterValue;
  setFilters: (value: GroupFilterValue) => void;
}>;

const filterDisplayedInitialValue = {
  categories: true,
  brands: false,
};

// Varied widths so the placeholder reads as a list of filter labels
const FILTER_SKELETON_WIDTHS = ['w-3/4', 'w-1/2', 'w-2/3', 'w-3/5', 'w-2/5'];

type FilterContentArgs = {
  isPending: boolean;
  isError: boolean;
  isRetrying: boolean;
  onRetry: () => void;
  errorMessage: string;
  checkboxes: ReactNode[];
};

const getFilterContent = ({
  isPending,
  isError,
  isRetrying,
  onRetry,
  errorMessage,
  checkboxes,
}: FilterContentArgs): ReactNode[] => {
  if (isPending) {
    return FILTER_SKELETON_WIDTHS.map((width) => (
      <Skeleton
        key={width}
        className={`h-5 ${width}`}
      />
    ));
  }

  if (isError) {
    return [
      <StateMessage
        key="error"
        variant="error"
        message={errorMessage}
        className="p-2"
      >
        <RetryButton
          onRetry={onRetry}
          isRetrying={isRetrying}
        />
      </StateMessage>,
    ];
  }

  return checkboxes;
};

export default function FiltersSidebar({
  inputSearchQuery,
  setInputSearchQuery,
  handleSearchFormSubmit,
  handleFilterValueChange,
  handleClearInputSearchQuery,
  filters,
  setFilters,
}: Props) {
  const [isFilterDisplayed, setIsFilterDisplayed] = useState(filterDisplayedInitialValue);

  const brandsQuery = useBrands();
  const categoriesQuery = useCategories();
  const brands = brandsQuery.data;
  const categories = categoriesQuery.data;

  const brandFilterCheckboxes = (brands ?? []).map(({ id, name }) => (
    <Checkbox
      key={name}
      label={name}
      checked={filters.brandIds.includes(id)}
      onChange={(isChecked) => {
        handleFilterValueChange('brandIds', id, isChecked);
      }}
    />
  ));

  const categoryFilterCheckboxes = (categories ?? []).map(({ id, name }) => (
    <Checkbox
      key={name}
      label={name}
      checked={filters.categoryIds.includes(id)}
      onChange={(isChecked) => {
        handleFilterValueChange('categoryIds', id, isChecked);
      }}
    />
  ));

  const categoriesContent = getFilterContent({
    isPending: categoriesQuery.isPending,
    isError: categoriesQuery.isError,
    isRetrying: categoriesQuery.isFetching,
    onRetry: () => {
      void categoriesQuery.refetch();
    },
    errorMessage: 'Категориите не можеа да се вчитаат.',
    checkboxes: categoryFilterCheckboxes,
  });

  const brandsContent = getFilterContent({
    isPending: brandsQuery.isPending,
    isError: brandsQuery.isError,
    isRetrying: brandsQuery.isFetching,
    onRetry: () => {
      void brandsQuery.refetch();
    },
    errorMessage: 'Брендовите не можеа да се вчитаат.',
    checkboxes: brandFilterCheckboxes,
  });

  const handleFilterDisplayToggle = (key: keyof GroupFilterDisplay) => {
    setIsFilterDisplayed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleClearFilters = () => {
    if (filters.brandIds.length === 0 && filters.categoryIds.length === 0) {
      return;
    }
    setFilters({ brandIds: [], categoryIds: [] });
  };

  return (
    <Card className="flex h-fit flex-col gap-5 p-5 md:sticky md:top-20">
      <form
        onSubmit={handleSearchFormSubmit}
        className="relative"
      >
        <Input
          type="text"
          name="query"
          aria-label="Пребарај суплементи"
          placeholder="Пример. Vitamin C"
          value={inputSearchQuery || ''}
          className="pr-20 text-sm"
          onChange={(e) => {
            setInputSearchQuery(e.target.value);
          }}
        />

        <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
          {inputSearchQuery && (
            <Tooltip text="Исчисти пребарување">
              <IconButton
                label="Исчисти пребарување"
                size="sm"
                onClick={handleClearInputSearchQuery}
              >
                <XIcon className="h-4 w-4" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip text="Пребарувај">
            <IconButton
              label="Пребарувај"
              size="sm"
              type="submit"
            >
              <SearchIcon className="h-4 w-4" />
            </IconButton>
          </Tooltip>
        </div>
      </form>

      <div className="text-center">
        <button
          onClick={handleClearFilters}
          className="text-info focus-visible:outline-primary cursor-pointer rounded text-sm font-medium transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          [Избриши ги сите филтери]
        </button>
      </div>

      <div className="flex flex-col gap-5">
        <CheckboxesFilter
          filterTitle="Филтрирај по категорија"
          filterType="categories"
          checkboxes={categoriesContent}
          handleFilterDisplayToggle={handleFilterDisplayToggle}
          isFilterDisplayed={isFilterDisplayed}
        />

        <CheckboxesFilter
          filterTitle="Филтрирај по бренд"
          filterType="brands"
          checkboxes={brandsContent}
          handleFilterDisplayToggle={handleFilterDisplayToggle}
          isFilterDisplayed={isFilterDisplayed}
        />
      </div>
    </Card>
  );
}
