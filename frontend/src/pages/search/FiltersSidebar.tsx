import { useState, type FormEvent } from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
import type {
  BackendBrand,
  BackendPharmacy,
  ProductFiltersDisplay,
  ProductFiltersValues,
} from '../../types/product';
import Filter from './Filter';

type Props = {
  inputSearchQuery: string;
  setInputSearchQuery: (value: string) => void;
  handleSearchFormSubmit: (e: FormEvent) => void;
  brands: Array<BackendBrand>;
  pharmacies: Array<BackendPharmacy>;
  handleFilterValueChange: (
    key: keyof ProductFiltersValues,
    value: number,
    isChecked: boolean
  ) => void;
  handleClearInputSearchQuery: () => void;
  filters: ProductFiltersValues;
  setFilters: (value: ProductFiltersValues) => void;
};

const filterDisplayedInitialValue = {
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
    <div key={id}>
      <input
        type="checkbox"
        value={id}
        onChange={(e) => handleFilterValueChange('pharmacyIds', id, e.target.checked)}
        checked={filters['pharmacyIds'].includes(id)}
      />
      {name}
    </div>
  ));

  const brandFilterCheckboxes = brands.map(({ id, name, products_by_brand_count }) => (
    <div key={name}>
      <input
        type="checkbox"
        value={name}
        onChange={(e) => handleFilterValueChange('brandIds', id, e.target.checked)}
        checked={filters['brandIds'].includes(id)}
      />

      <span
        className={products_by_brand_count === 0 ? 'text-dark/50' : ''}
      >{`${name} (${products_by_brand_count})`}</span>
    </div>
  ));

  const handleFilterDisplayToggle = (key: keyof ProductFiltersDisplay) => {
    setIsFilterDisplayed((oldValue) => ({ ...oldValue, [key]: !oldValue[key] }));
  };

  const handleClearFilters = () => {
    if (filters['brandIds'].length === 0 && filters['pharmacyIds'].length === 0) {
      return;
    }
    setFilters({ brandIds: [], pharmacyIds: [] });
  };

  return (
    <div className="sticky top-2 flex w-[20%] flex-col p-4">
      <form
        onSubmit={handleSearchFormSubmit}
        className="mb-7"
      >
        <input
          className="relative w-full rounded-2xl border-2 px-4 py-2 outline-none"
          type="text"
          name="query"
          placeholder="Ex. vitamin c ..."
          value={inputSearchQuery ?? ''}
          onChange={(e) => setInputSearchQuery(e.target.value)}
        />
        <p>
          <button
            type="submit"
            className="hover:text-primary absolute top-6 right-8 flex cursor-pointer"
          >
            <SearchIcon />
          </button>
          <button
            className="hover:text-primary absolute top-6 right-16 flex cursor-pointer"
            onClick={handleClearInputSearchQuery}
          >
            <XIcon />
          </button>
        </p>
      </form>
      <div
        onClick={handleClearFilters}
        className="cursor-pointer text-center"
      >
        [Clear filters]
      </div>
      <div className="flex flex-col justify-around gap-5">
        <Filter
          filterTitle="Filter by pharmacies "
          filterType="pharmacies"
          checkboxes={pharmacyNameFilterCheckboxes}
          handleFilterDisplayToggle={handleFilterDisplayToggle}
          isFilterDisplayed={isFilterDisplayed}
        />
        <Filter
          filterTitle="Filter by brand "
          filterType="brands"
          checkboxes={brandFilterCheckboxes}
          handleFilterDisplayToggle={handleFilterDisplayToggle}
          isFilterDisplayed={isFilterDisplayed}
        />
      </div>
    </div>
  );
}
