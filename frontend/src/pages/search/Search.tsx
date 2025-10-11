import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';

import * as ProductAPI from '../../api/products';
import type {
  BackendProduct,
  BackendProductBrand,
  ProductFiltersValues,
} from '../../types/product';
import FiltersSidebar from './FiltersSidebar';
import ProductsGrid from './ProductsGrid';

const filtersDefault = {
  pharmacies: [],
  brands: [],
};

export default function Search() {
  const [inputSearchQuery, setInputSearchQuery] = useState<string>('');
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Array<BackendProduct>>([]);
  const [error, setError] = useState<string | null>(null);
  const [brands, setBrands] = useState<Array<BackendProductBrand>>([]);
  const [filters, setFilters] = useState<ProductFiltersValues>(filtersDefault);

  const initialQuery = searchParams.get('query');

  const fetchProducts = async (blank: boolean) => {
    const params = blank
      ? {}
      : {
          ...filters,
          searchQueryParam: initialQuery ?? inputSearchQuery,
        };
    const response = await ProductAPI.getProducts(params);

    if (response.status) {
      setProducts(response.data);
    } else {
      setProducts([]);
      setError(response.errors_type);
    }
  };

  const fetchProductsBrands = async (blank: boolean) => {
    const params = blank ? '' : (initialQuery ?? inputSearchQuery);
    const response = await ProductAPI.getProductsBrands(params);

    if (response.status) {
      setBrands(response.data);
    } else {
      setBrands([]);
      setError(response.errors_type);
    }
  };

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
    value: string,
    isChecked: boolean
  ) => {
    if (isChecked) {
      setFilters((oldValue) => ({ ...oldValue, [key]: [...oldValue[key], value] }));
    } else {
      setFilters((oldValue) => ({ ...oldValue, [key]: oldValue[key].filter((v) => v !== value) }));
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
    <div className="flex min-h-[90vh] w-full justify-around">
      <FiltersSidebar
        handleSearchFormSubmit={handleSearchFormSubmit}
        inputSearchQuery={inputSearchQuery}
        setInputSearchQuery={setInputSearchQuery}
        brands={brands}
        handleFilterValueChange={handleFilterChange}
        handleClearInputSearchQuery={handleClearInputSearchQuery}
        filters={filters}
        setFilters={setFilters}
      />
      {error ?? <ProductsGrid products={products} />}
    </div>
  );
}
