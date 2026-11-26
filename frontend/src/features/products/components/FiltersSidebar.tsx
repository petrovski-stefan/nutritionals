import { SearchIcon, SlidersHorizontalIcon, XIcon } from 'lucide-react';
import { type FormEvent, type ReactNode, useState } from 'react';

import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
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
import { MIN_SEARCH_QUERY_LENGTH } from '@/features/products/schemas';
import type { GroupFilterDisplay, GroupFilterValue } from '@/features/products/types/productgroups';

import CheckboxesFilter from './CheckboxesFilter';

type Props = Readonly<{
  inputSearchQuery: string;
  setInputSearchQuery: (value: string) => void;
  showLengthHint: boolean;
  handleSearchFormSubmit: (e: FormEvent) => void;

  handleFilterValueChange: (key: keyof GroupFilterValue, value: number, isChecked: boolean) => void;
  handleClearInputSearchQuery: () => void;
  filters: GroupFilterValue;
  handleClearFilters: () => void;
}>;

const filterDisplayedInitialValue = {
  categories: true,
  brands: false,
};

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
  showLengthHint,
  handleSearchFormSubmit,
  handleFilterValueChange,
  handleClearInputSearchQuery,
  filters,
  handleClearFilters,
}: Props) {
  const [isFilterDisplayed, setIsFilterDisplayed] = useState(filterDisplayedInitialValue);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

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

  const activeFiltersCount = filters.brandIds.length + filters.categoryIds.length;
  const hasActiveFilters = activeFiltersCount > 0;

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
          placeholder="пр. Vitamin C"
          value={inputSearchQuery || ''}
          className="pr-20 pointer-coarse:pr-24"
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

      {showLengthHint && (
        <p
          role="status"
          className="text-text-muted -mt-3 text-sm"
        >
          Внесете најмалку {MIN_SEARCH_QUERY_LENGTH} карактери.
        </p>
      )}

      <Button
        variant="outline"
        className="w-full md:hidden"
        aria-expanded={isMobileFiltersOpen}
        aria-controls="compare-filters"
        onClick={() => {
          setIsMobileFiltersOpen((prev) => !prev);
        }}
      >
        <SlidersHorizontalIcon
          aria-hidden="true"
          className="h-4 w-4"
        />
        {isMobileFiltersOpen ? 'Сокриј ги филтрите' : 'Филтри'}
        {hasActiveFilters && <Badge variant="success">{activeFiltersCount}</Badge>}
      </Button>

      <div
        id="compare-filters"
        className={`${isMobileFiltersOpen ? 'flex' : 'hidden'} flex-col gap-5 md:flex`}
      >
        <div className="text-center">
          {/* Disabled rather than hidden, so the filter lists do not jump when the first one is set */}
          <button
            type="button"
            disabled={!hasActiveFilters}
            onClick={handleClearFilters}
            className="text-info focus-visible:outline-primary rounded px-2 py-2 text-sm font-medium transition duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 enabled:hover:underline enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
          >
            Исчисти ги филтрите
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
      </div>
    </Card>
  );
}
