import { useState, type FormEvent } from 'react';
import { PHARMACY_MAP } from '../../constants/pharmacies';
import { SearchIcon, XIcon } from 'lucide-react';
import type {
  BackendProductBrand,
  ProductFiltersDisplay,
  ProductFiltersValues,
} from '../../types/product';
import Filter from './Filter';

type Props = {
  inputSearchQuery: string;
  setInputSearchQuery: (value: string) => void;
  handleSearchFormSubmit: (e: FormEvent) => void;
  brands: Array<BackendProductBrand>;
  handleFilterValueChange: (
    key: keyof ProductFiltersValues,
    value: string,
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
  handleFilterValueChange,
  handleClearInputSearchQuery,
  filters,
  setFilters,
}: Props) {
  const [isFilterDisplayed, setIsFilterDisplayed] = useState(filterDisplayedInitialValue);

  const pharmacyNameFilterCheckboxes = Object.entries(PHARMACY_MAP).map(([key, value]) => (
    <div key={key}>
      <input
        type="checkbox"
        value={value}
        onChange={(e) => handleFilterValueChange('pharmacies', value, e.target.checked)}
        checked={filters['pharmacies'].includes(value)}
      />
      {key}
    </div>
  ));

  const brandFilterCheckboxes = brands.map(({ brand, products_by_brand_count }) => (
    <div key={brand}>
      <input
        type="checkbox"
        value={brand}
        onChange={(e) => handleFilterValueChange('brands', brand, e.target.checked)}
        checked={filters['brands'].includes(brand)}
      />

      <span
        className={products_by_brand_count === 0 ? 'text-dark/50' : ''}
      >{`${brand} (${products_by_brand_count})`}</span>
    </div>
  ));

  const handleFilterDisplayToggle = (key: keyof ProductFiltersDisplay) => {
    setIsFilterDisplayed((oldValue) => ({ ...oldValue, [key]: !oldValue[key] }));
  };

  const handleClearFilters = () => {
    if (filters['brands'].length === 0 && filters['pharmacies'].length === 0) {
      return;
    }
    setFilters({ brands: [], pharmacies: [] });
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
