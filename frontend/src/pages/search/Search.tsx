import { useEffect, useState, type FormEvent } from 'react';

import FiltersSidebar from './FiltersSidebar';
import ProductsGrid from './ProductsGrid';
import BrandService from '../../api/brand';
import type { BackendBrandWithGroupCount } from '../../types/brand';
import type { BackendCategory } from '../../types/category';
import CategoryService from '../../api/category';
import type { BackendProductGroup, GroupFilterValue } from '../../types/productgroup';
import * as ProductGroupService from '../../api/productgroup';

const filtersDefault = {
  brandIds: [],
  categoryIds: [],
};

export default function Search() {
  const [groups, setGroups] = useState<BackendProductGroup[]>([]);
  const [brands, setBrands] = useState<BackendBrandWithGroupCount[]>([]);
  const [categories, setCategories] = useState<BackendCategory[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<GroupFilterValue>(filtersDefault);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const pageSize = 6;

  const fetchProducts = async (blank?: boolean, page?: number) => {
    setError(null);
    setIsLoading(true);

    const pageForSearch = page || currentPage;
    const queryForSearch = blank ? '' : searchQuery;

    const response = await ProductGroupService.getProductGroups(
      queryForSearch,
      filters.categoryIds,
      filters.brandIds,
      pageForSearch
    );

    if (response.status) {
      setGroups(response.data.results);
      setTotalPages(Math.ceil(response.data.count / pageSize));
    } else {
      setGroups([]);
      setError(response.errors_type);
    }
    setIsLoading(false);
  };

  const fetchProductsBrands = async (blank: boolean) => {
    const params = blank ? '' : searchQuery;
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
      const response = await CategoryService.getCategories();

      if (response.status) {
        setCategories(response.data);
      } else {
        setCategories([]);
        setError(response.errors_type);
      }
    };
    fetchPharmacies();
  }, []);

  const fetchData = async (blank: boolean = false, page?: number) => {
    await Promise.all([fetchProducts(blank, page), fetchProductsBrands(blank)]);
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(filters), currentPage]);

  const handleFilterChange = (key: keyof GroupFilterValue, value: number, isChecked: boolean) => {
    if (isChecked) {
      setFilters((prev) => ({
        ...prev,
        [key]: [...prev[key], value],
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [key]: prev[key].filter((v) => v !== value),
      }));
    }

    setCurrentPage(1);
  };

  const handleSearchFormSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (searchQuery.length < 2) {
      return;
    }

    setCurrentPage(1);
    fetchData(false, 1);
  };

  const handleClearInputSearchQuery = async () => {
    if (searchQuery === '') {
      return;
    }

    setSearchQuery('');
    setCurrentPage(1);
    await fetchData(true);
  };

  const handleClickPagination = (back: boolean) => {
    if (back) {
      if (currentPage === 1) {
        return;
      }

      setCurrentPage((prev) => prev - 1);
    } else {
      if (currentPage === totalPages) {
        return;
      }
      setCurrentPage((prev) => prev + 1);
    }
  };
  return (
    <div className="relative flex min-h-screen w-full flex-col justify-around md:flex-row">
      <FiltersSidebar
        handleSearchFormSubmit={handleSearchFormSubmit}
        inputSearchQuery={searchQuery}
        setInputSearchQuery={setSearchQuery}
        brands={brands}
        categories={categories}
        handleFilterValueChange={handleFilterChange}
        handleClearInputSearchQuery={handleClearInputSearchQuery}
        filters={filters}
        setFilters={setFilters}
      />
      {!isLoading && !error && (
        <ProductsGrid
          groups={groups}
          totalPages={totalPages}
          currentPage={currentPage}
          handlePaginationClick={handleClickPagination}
        />
      )}
      {!isLoading && error}
      {isLoading && (
        <div className="ml-10 flex h-full w-[75%] flex-wrap justify-center gap-10 p-4">
          <div className="border-t-accent h-16 w-16 animate-spin rounded-full border-4 border-gray-200"></div>
        </div>
      )}
    </div>
  );
}
