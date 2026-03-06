import { useEffect, useState, type FormEvent } from 'react';

import FiltersSidebar from './FiltersSidebar';
import ProductsGrid from './ProductsGrid';
import BrandService from '../../api/brand';
import type { BackendBrandWithGroupCount } from '../../types/brand';
import type { BackendCategory } from '../../types/category';
import CategoryService from '../../api/category';
import type { BackendProductGroup, GroupFilterValue } from '../../types/productgroup';
import * as ProductGroupService from '../../api/productgroup';
import type { IsLoading, Error } from './types';

const filtersDefault = {
  brandIds: [],
  categoryIds: [],
};

const defaultError: Error = {
  productToMyList: null,
  myLists: null,
  createNewMyList: null,
  brands: null,
  categories: null,
  groups: null,
};

const defaultIsLoading: IsLoading = {
  productToMyList: false,
  myLists: false,
  createNewMyList: false,
  brands: false,
  categories: false,
  groups: false,
};

const pageSize = 6;

export default function ComparePrices() {
  const [groups, setGroups] = useState<BackendProductGroup[]>([]);
  const [brands, setBrands] = useState<BackendBrandWithGroupCount[]>([]);
  const [categories, setCategories] = useState<BackendCategory[]>([]);

  const [error, setError] = useState(defaultError);
  const [isLoading, setIsLoading] = useState(defaultIsLoading);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<GroupFilterValue>(filtersDefault);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleErrorChange = <K extends keyof Error>(key: K, value: Error[K]) => {
    setError((prev) => ({ ...prev, [key]: value }));
  };

  const handleIsLoadingChange = <K extends keyof IsLoading>(key: K, value: IsLoading[K]) => {
    setIsLoading((prev) => ({ ...prev, [key]: value }));
  };

  const fetchGroups = async (blank?: boolean, page?: number) => {
    handleErrorChange('groups', null);
    handleIsLoadingChange('groups', true);

    const pageForSearch = page || currentPage;
    const queryForSearch = blank ? '' : searchQuery;

    try {
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
      }
    } catch (error) {
      handleErrorChange('groups', 'unexpectedError');
    } finally {
      handleIsLoadingChange('groups', false);
    }
  };

  const fetchBrands = async (blank: boolean) => {
    handleIsLoadingChange('brands', false);
    handleErrorChange('brands', null);

    const params = blank ? '' : searchQuery;

    try {
      const response = await BrandService.getBrandsWithProductCount(params);

      if (response.status) {
        setBrands(response.data);
      }
    } catch (error) {
      handleErrorChange('brands', 'unexpectedError');
    } finally {
      handleIsLoadingChange('brands', false);
    }
  };

  useEffect(() => {
    const fetchPharmacies = async () => {
      handleIsLoadingChange('categories', true);
      handleErrorChange('categories', null);

      try {
        const response = await CategoryService.getCategories();

        if (response.status) {
          setCategories(response.data);
        }
      } catch (error) {
        handleErrorChange('categories', 'unexpectedError');
      } finally {
        handleIsLoadingChange('categories', false);
      }
    };
    fetchPharmacies();
  }, []);

  const fetchData = async (blank: boolean = false, page?: number) => {
    await Promise.all([fetchGroups(blank, page), fetchBrands(blank)]);
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

      <ProductsGrid
        groups={groups}
        totalPages={totalPages}
        currentPage={currentPage}
        handlePaginationClick={handleClickPagination}
        error={error}
        isLoading={isLoading}
        handleErrorChange={handleErrorChange}
        handleIsLoadingChange={handleIsLoadingChange}
      />
    </div>
  );
}
