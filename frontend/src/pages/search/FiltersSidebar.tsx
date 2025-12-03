import { useState, type FormEvent } from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
import type { ProductFiltersDisplay, ProductFiltersValues } from '../../types/product';
import CheckboxesFilter from './CheckboxesFilter';
import type { BackendBrandWithProductCount } from '../../types/brand';
import type { BackendPharmacy } from '../../types/pharmacy';
import SEARCH_TEXT from '../../locale/search';

type Props = {
  inputSearchQuery: string;
  setInputSearchQuery: (value: string) => void;
  handleSearchFormSubmit: (e: FormEvent) => void;
  brands: Array<BackendBrandWithProductCount>;
  pharmacies: Array<BackendPharmacy>;
  handleFilterValueChange: (
    key: keyof ProductFiltersValues,
    value: number,
    isChecked: boolean,
    isDiscountFilter?: boolean
  ) => void;
  handleClearInputSearchQuery: () => void;
  filters: ProductFiltersValues;
  setFilters: (value: ProductFiltersValues) => void;
};

const filterDisplayedInitialValue = {
  discount: true,
  pharmacies: true,
  brands: false,
};

export default function FiltersSidebar({
  inputSearchQuery,
  setInputSearchQuery,
  handleSearchFormSubmit,
  brands,
  pharmacies,
  handleFilterValueChange,
  handleClearInputSearchQuery,
  filters,
  setFilters,
}: Props) {
  const [isFilterDisplayed, setIsFilterDisplayed] = useState(filterDisplayedInitialValue);

  const pharmacyNameFilterCheckboxes = pharmacies.map(({ id, name }) => (
    <label
      key={id}
      className="text-dark/80 hover:text-primary flex cursor-pointer items-center gap-2 text-sm"
    >
      <input
        type="checkbox"
        value={id}
        onChange={(e) => handleFilterValueChange('pharmacyIds', id, e.target.checked)}
        checked={filters['pharmacyIds'].includes(id)}
        className="accent-primary h-4 w-4 rounded border-neutral-300"
      />
      {name}
    </label>
  ));

  const brandFilterCheckboxes = brands.map(({ id, name, products_by_brand_count }) => (
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
      <span className={products_by_brand_count === 0 ? 'text-dark/40' : ''}>
        {name} ({products_by_brand_count})
      </span>
    </label>
  ));

  const discountCheckboxes = [`${SEARCH_TEXT['filters']['discountFilterValue']}`].map(
    (name, id) => (
      <label
        key={name}
        className="text-dark/80 hover:text-primary flex cursor-pointer items-center gap-2 text-sm"
      >
        <input
          type="checkbox"
          value={name}
          onChange={(e) => handleFilterValueChange('discount', id, e.target.checked, true)}
          checked={filters['discount']}
          className="accent-primary h-4 w-4 rounded border-neutral-300"
        />
        {name}
      </label>
    )
  );

  const handleFilterDisplayToggle = (key: keyof ProductFiltersDisplay) => {
    setIsFilterDisplayed((oldValue) => ({ ...oldValue, [key]: !oldValue[key] }));
  };

  const handleClearFilters = () => {
    if (filters['brandIds'].length === 0 && filters['pharmacyIds'].length === 0) {
      return;
    }
    setFilters({ brandIds: [], pharmacyIds: [], discount: false });
  };

  return (
    <aside className="bg-neutral sticky top-4 mt-4 ml-4 flex h-fit w-[22%] flex-col gap-6 rounded-2xl border border-neutral-300 p-5 shadow-sm">
      {/* Search */}
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
          className="hover:text-primary absolute top-2.5 right-3 text-gray-400 transition-colors"
        >
          <SearchIcon className="h-5 w-5" />
        </button>
        {inputSearchQuery && (
          <button
            type="button"
            onClick={handleClearInputSearchQuery}
            className="hover:text-primary absolute top-2.5 right-9 text-gray-400 transition-colors"
          >
            <XIcon className="h-5 w-5" />
          </button>
        )}
      </form>

      {/* Clear Filters */}
      <div className="text-center">
        <button
          onClick={handleClearFilters}
          className="text-secondary hover:text-accent cursor-pointer text-sm font-medium transition-colors"
        >
          {SEARCH_TEXT['filters']['clearFilters']}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-5">
        <CheckboxesFilter
          filterTitle={SEARCH_TEXT['filters']['discountFilterTitle']}
          filterType="discount"
          checkboxes={discountCheckboxes}
          handleFilterDisplayToggle={handleFilterDisplayToggle}
          isFilterDisplayed={isFilterDisplayed}
        />
        <CheckboxesFilter
          filterTitle={SEARCH_TEXT['filters']['pharmaciesFilterTitle']}
          filterType="pharmacies"
          checkboxes={pharmacyNameFilterCheckboxes}
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
