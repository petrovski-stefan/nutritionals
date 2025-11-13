import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';

import ProductService from '../../api/product';
import type { BackendProduct, ProductFiltersValues } from '../../types/product';
import FiltersSidebar from './FiltersSidebar';
import ProductsGrid from './ProductsGrid';
import BrandService from '../../api/brand';
import PharmacyService from '../../api/pharmacy';
import type { BackendBrandWithProductCount } from '../../types/brand';
import type { BackendPharmacy } from '../../types/pharmacy';

const filtersDefault = {
  pharmacyIds: [],
  brandIds: [],
  discount: false,
};

export default function Search() {
  const [inputSearchQuery, setInputSearchQuery] = useState<string>('');
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Array<BackendProduct>>([]);
  const [error, setError] = useState<string | null>(null);
  const [brands, setBrands] = useState<Array<BackendBrandWithProductCount>>([]);
  const [pharmacies, setPharmacies] = useState<Array<BackendPharmacy>>([]);
  const [filters, setFilters] = useState<ProductFiltersValues>(filtersDefault);

  const initialQuery = searchParams.get('query');

  const fetchProducts = async (blank: boolean) => {
    const params = blank
      ? {}
      : {
          ...filters,
          searchQueryParam: initialQuery ?? inputSearchQuery,
        };
    const response = await ProductService.getProducts(params);

    if (response.status) {
      setProducts(response.data);
    } else {
      setProducts([]);
      setError(response.errors_type);
    }
  };

  const fetchProductsBrands = async (blank: boolean) => {
    const params = blank ? '' : (initialQuery ?? inputSearchQuery);
    const response = await BrandService.getBrandsWithProductCount(params);

    if (response.status) {
      setBrands(response.data);
    } else {
      setBrands([]);
      setError(response.errors_type);
    }
  };

  useEffect(() => {
    const fetchPharmacies = async () => {
      const response = await PharmacyService.getPharmacies();

      if (response.status) {
        setPharmacies(response.data);
      } else {
        setPharmacies([]);
        setError(response.errors_type);
      }
    };
    fetchPharmacies();
  }, []);

  const fetchData = async (blank: boolean = false) => {
    await Promise.all([fetchProducts(blank), fetchProductsBrands(blank)]);
  };

  useEffect(() => {
    if (initialQuery) {
      setInputSearchQuery(initialQuery as string);
      setSearchParams(undefined);
    }

    fetchData();
  }, [JSON.stringify(filters)]);

  const handleFilterChange = (
    key: keyof ProductFiltersValues,
    value: number,
    isChecked: boolean,
    isDiscountFilter: boolean = false
  ) => {
    if (isDiscountFilter) {
      setFilters((prev) => ({ ...prev, [key]: isChecked }));
      return;
    }

    if (isChecked) {
      setFilters((oldValue) => ({
        ...oldValue,
        [key]: [...(oldValue[key] as Array<number>), value],
      }));
    } else {
      setFilters((oldValue) => ({
        ...oldValue,
        [key]: (oldValue[key] as Array<number>).filter((v) => v !== value),
      }));
    }
  };

  const handleSearchFormSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (inputSearchQuery.length < 2) {
      return;
    }

    fetchData();
  };

  const handleClearInputSearchQuery = async () => {
    if (inputSearchQuery === '') {
      return;
    }

    setInputSearchQuery('');
    fetchData(true);
  };

  return (
    <div className="relative flex min-h-[90vh] w-full justify-around">
      <FiltersSidebar
        handleSearchFormSubmit={handleSearchFormSubmit}
        inputSearchQuery={inputSearchQuery}
        setInputSearchQuery={setInputSearchQuery}
        brands={brands}
        pharmacies={pharmacies}
        handleFilterValueChange={handleFilterChange}
        handleClearInputSearchQuery={handleClearInputSearchQuery}
        filters={filters}
        setFilters={setFilters}
      />
      {error ?? <ProductsGrid products={products} />}
    </div>
  );
}
