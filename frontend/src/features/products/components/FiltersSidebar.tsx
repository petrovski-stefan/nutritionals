import { SearchIcon, XIcon } from 'lucide-react';
import { type FormEvent, useState } from 'react';

import Card from '../../../components/ui/Card';
import Checkbox from '../../../components/ui/Checkbox';
import IconButton from '../../../components/ui/IconButton';
import Input from '../../../components/ui/Input';
import Tooltip from '../../../components/ui/Tooltip';
import useBrands from '../hooks/useBrands';
import useCategories from '../hooks/useCategories';
import SEARCH_TEXT from '../locale/search';
import type { GroupFilterDisplay, GroupFilterValue } from '../types/productgroups';
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

  const { data: brands, isError: brandsIsError } = useBrands();

  const { data: categories, isError: categoriesIsError } = useCategories();

  const brandFilterCheckboxes = (brands || []).map(({ id, name }) => (
    <Checkbox
      key={name}
      label={name}
      checked={filters['brandIds'].includes(id)}
      onChange={(isChecked) => {
        handleFilterValueChange('brandIds', id, isChecked);
      }}
    />
  ));

  const categoryFilterCheckboxes = (categories || []).map(({ id, name }) => (
    <Checkbox
      key={name}
      label={name}
      checked={filters['categoryIds'].includes(id)}
      onChange={(isChecked) => {
        handleFilterValueChange('categoryIds', id, isChecked);
      }}
    />
  ));

  const categoriesContent = categoriesIsError
    ? [
        <p
          key="categories-error"
          className="text-danger text-sm"
        >
          {SEARCH_TEXT['filters']['categories']['error']['unexpectedError']}
        </p>,
      ]
    : categoryFilterCheckboxes;

  const brandsContent = brandsIsError
    ? [
        <p
          key="brands-error"
          className="text-danger text-sm"
        >
          {SEARCH_TEXT['filters']['brands']['error']['unexpectedError']}
        </p>,
      ]
    : brandFilterCheckboxes;

  const handleFilterDisplayToggle = (key: keyof GroupFilterDisplay) => {
    setIsFilterDisplayed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleClearFilters = () => {
    if (filters['brandIds'].length === 0 && filters['categoryIds'].length === 0) {
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
          placeholder={SEARCH_TEXT['filters']['search']['placeholder']}
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
          className="text-info hover:text-accent focus-visible:outline-primary cursor-pointer rounded text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {SEARCH_TEXT['filters']['clearFilters']}
        </button>
      </div>

      <div className="flex flex-col gap-5">
        <CheckboxesFilter
          filterTitle={SEARCH_TEXT['filters']['categories']['filterTitle']}
          filterType="categories"
          checkboxes={categoriesContent}
          handleFilterDisplayToggle={handleFilterDisplayToggle}
          isFilterDisplayed={isFilterDisplayed}
        />

        <CheckboxesFilter
          filterTitle={SEARCH_TEXT['filters']['brands']['filterTitle']}
          filterType="brands"
          checkboxes={brandsContent}
          handleFilterDisplayToggle={handleFilterDisplayToggle}
          isFilterDisplayed={isFilterDisplayed}
        />
      </div>
    </Card>
  );
}
