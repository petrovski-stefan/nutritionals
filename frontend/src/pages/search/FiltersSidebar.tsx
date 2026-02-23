import { useState, type FormEvent } from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
import type { GroupFilterDisplay, GroupFilterValue } from '../../types/productgroup';
import CheckboxesFilter from './CheckboxesFilter';
import type { BackendBrandWithGroupCount } from '../../types/brand';
import SEARCH_TEXT from '../../locale/search';
import Tooltip from '../../components/Tooltip';
import type { BackendCategory } from '../../types/category';

type Props = {
  inputSearchQuery: string;
  setInputSearchQuery: (value: string) => void;
  handleSearchFormSubmit: (e: FormEvent) => void;
  brands: Array<BackendBrandWithGroupCount>;
  categories: BackendCategory[];
  handleFilterValueChange: (key: keyof GroupFilterValue, value: number, isChecked: boolean) => void;
  handleClearInputSearchQuery: () => void;
  filters: GroupFilterValue;
  setFilters: (value: GroupFilterValue) => void;
};

const filterDisplayedInitialValue = {
  categories: true,
  brands: false,
};

export default function FiltersSidebar({
  inputSearchQuery,
  setInputSearchQuery,
  handleSearchFormSubmit,
  brands,
  categories,
  handleFilterValueChange,
  handleClearInputSearchQuery,
  filters,
  setFilters,
}: Props) {
  const [isFilterDisplayed, setIsFilterDisplayed] = useState(filterDisplayedInitialValue);

  const brandFilterCheckboxes = brands.map(({ id, name, group_count }) => (
    <label
      key={name}
      className="text-dark/80 hover:text-primary flex cursor-pointer items-center gap-2 text-sm"
    >
      <input
        type="checkbox"
        value={name}
        onChange={(e) => handleFilterValueChange('brandIds', id, e.target.checked)}
        checked={filters['brandIds'].includes(id)}
        className="accent-primary h-4 w-4 rounded border-neutral-300"
      />
      <span className={group_count === 0 ? 'text-dark/40' : ''}>
        {name} ({group_count})
      </span>
    </label>
  ));

  const categoryFilterCheckboxes = categories.map(({ id, name }) => (
    <label
      key={name}
      className="text-dark/80 hover:text-primary flex cursor-pointer items-center gap-2 text-sm"
    >
      <input
        type="checkbox"
        value={name}
        onChange={(e) => handleFilterValueChange('categoryIds', id, e.target.checked)}
        checked={filters['categoryIds'].includes(id)}
        className="accent-primary h-4 w-4 rounded border-neutral-300"
      />
      <span>{name}</span>
    </label>
  ));

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
    <aside className="bg-neutral top-4 mt-4 flex h-fit w-full flex-col gap-6 rounded-2xl border border-neutral-300 p-5 shadow-sm md:sticky md:ml-4 md:w-[25%]">
      <form
        onSubmit={handleSearchFormSubmit}
        className="relative"
      >
        <input
          className="focus:ring-primary text-dark w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm focus:ring-2 focus:outline-none"
          type="text"
          name="query"
          placeholder={SEARCH_TEXT['filters']['searchPlaceholder']}
          value={inputSearchQuery ?? ''}
          onChange={(e) => setInputSearchQuery(e.target.value)}
        />
        <button
          type="submit"
          className="hover:text-primary absolute top-2.5 right-3 cursor-pointer text-gray-400 transition-colors"
        >
          <Tooltip text="Пребарувај">
            <SearchIcon className="h-5 w-5" />
          </Tooltip>
        </button>
        {inputSearchQuery && (
          <button
            type="button"
            onClick={handleClearInputSearchQuery}
            className="hover:text-primary absolute top-2.5 right-9 cursor-pointer text-gray-400 transition-colors"
          >
            <Tooltip text="Исчисти пребарување">
              <XIcon className="h-5 w-5" />
            </Tooltip>
          </button>
        )}
      </form>

      <div className="text-center">
        <button
          onClick={handleClearFilters}
          className="text-secondary hover:text-accent cursor-pointer text-sm font-medium transition-colors"
        >
          {SEARCH_TEXT['filters']['clearFilters']}
        </button>
      </div>

      <div className="flex flex-col gap-5">
        <CheckboxesFilter
          filterTitle={SEARCH_TEXT['filters']['categoryFilterTitle']}
          filterType="categories"
          checkboxes={categoryFilterCheckboxes}
          handleFilterDisplayToggle={handleFilterDisplayToggle}
          isFilterDisplayed={isFilterDisplayed}
        />

        <CheckboxesFilter
          filterTitle={SEARCH_TEXT['filters']['brandsFilterTitle']}
          filterType="brands"
          checkboxes={brandFilterCheckboxes}
          handleFilterDisplayToggle={handleFilterDisplayToggle}
          isFilterDisplayed={isFilterDisplayed}
        />
      </div>
    </aside>
  );
}
