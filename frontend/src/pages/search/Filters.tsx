import { useState, type FormEvent } from 'react';
import { PHARMACY_MAP } from './constants';
import { ChevronDownCircleIcon, ChevronUpCircleIcon, SearchIcon, XIcon } from 'lucide-react';
import type { BackendProductBrand, ProductFilters } from '../../types/product';

type Props = {
  inputSearchQuery: string;
  setInputSearchQuery: (value: string) => void;
  handleSearchFormSubmit: (e: FormEvent) => void;
  brands: Array<BackendProductBrand>;
  handleFilterChange: (key: keyof ProductFilters, value: string, isChecked: boolean) => void;
  handleClearInputSearchQuery: () => void;
};

const filterDisplayedInitialValue = {
  brands: true,
  pharmacies: true,
};

export default function Filters({
  inputSearchQuery,
  setInputSearchQuery,
  handleSearchFormSubmit,
  brands,
  handleFilterChange,
  handleClearInputSearchQuery,
}: Props) {
  const [isFilterDisplayed, setIsFilterDisplayed] = useState(filterDisplayedInitialValue);

  const pharmacyNameFilterCheckboxes = Object.entries(PHARMACY_MAP).map(([key, value]) => (
    <div key={key}>
      <input
        type="checkbox"
        value={value}
        onChange={(e) => handleFilterChange('pharmacies', value, e.target.checked)}
      />
      {key}
    </div>
  ));

  const brandFilterCheckboxes = brands.map(({ brand, products_by_brand_count }) => (
    <div key={brand}>
      <input
        type="checkbox"
        value={brand}
        onChange={(e) => handleFilterChange('brands', brand, e.target.checked)}
      />

      <span
        className={products_by_brand_count === 0 ? 'text-dark/50' : ''}
      >{`${brand} (${products_by_brand_count})`}</span>
    </div>
  ));

  const handleFilterDisplayToggle = (key: keyof typeof filterDisplayedInitialValue) => {
    setIsFilterDisplayed((oldValue) => ({ ...oldValue, [key]: !oldValue[key] }));
  };

  return (
    <div className="sticky top-2 flex w-[20%] flex-col p-4">
      <form onSubmit={handleSearchFormSubmit}>
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

      <div className="px-2">
        <span>Filter by pharmacies</span>
        <button
          onClick={(_) => handleFilterDisplayToggle('pharmacies')}
          className="cursor-pointer"
        >
          {isFilterDisplayed['pharmacies'] === true ? (
            <ChevronUpCircleIcon />
          ) : (
            <ChevronDownCircleIcon />
          )}
        </button>

        {isFilterDisplayed['pharmacies'] && pharmacyNameFilterCheckboxes}
      </div>

      <div className="px-2">
        <span>Filter by brand</span>
        <button
          onClick={(_) => handleFilterDisplayToggle('brands')}
          className="cursor-pointer"
        >
          {isFilterDisplayed['brands'] === true ? (
            <ChevronUpCircleIcon />
          ) : (
            <ChevronDownCircleIcon />
          )}
        </button>

        {isFilterDisplayed['brands'] && brandFilterCheckboxes}
      </div>
    </div>
  );
}
