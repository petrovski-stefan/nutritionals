import { type FormEvent, useState } from 'react';

import FiltersSidebar from '@/features/products/components/FiltersSidebar';
import ProductsGrid from '@/features/products/components/ProductsGrid';
import useProductGroups from '@/features/products/hooks/useProductGroups';
import type { GroupFilterValue } from '@/features/products/types/productgroups';

const filtersDefault: GroupFilterValue = {
  brandIds: [],
  categoryIds: [],
};

const PAGE_SIZE = 6;

export default function ComparePrices() {
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [filters, setFilters] = useState<GroupFilterValue>(filtersDefault);
  const [currentPage, setCurrentPage] = useState(1);

  const productGroupsQuery = useProductGroups(submittedQuery, filters, currentPage);

  const groups = productGroupsQuery.data?.results ?? [];
  const totalPages = Math.ceil((productGroupsQuery.data?.count ?? 0) / PAGE_SIZE);

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

  const handleSearchFormSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (searchQuery.length < 2) {
      return;
    }

    if (searchQuery === submittedQuery) {
      // Same key — react-query won't refetch on its own, but submit should always re-search
      setCurrentPage(1);
      if (currentPage === 1) {
        void productGroupsQuery.refetch();
      }
      return;
    }

    setCurrentPage(1);
    setSubmittedQuery(searchQuery);
  };

  const handleClearInputSearchQuery = () => {
    if (searchQuery === '' && submittedQuery === '') {
      return;
    }

    setSearchQuery('');
    setSubmittedQuery('');
    setCurrentPage(1);
  };

  const handleClickPagination = (back: boolean) => {
    // eslint-disable-next-line  sonarjs/no-selector-parameter
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
    <div className="mx-auto grid w-full max-w-[96rem] items-start gap-6 px-4 py-8 sm:px-6 md:grid-cols-[280px_1fr]">
      <FiltersSidebar
        handleSearchFormSubmit={handleSearchFormSubmit}
        inputSearchQuery={searchQuery}
        setInputSearchQuery={setSearchQuery}
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
        isPending={productGroupsQuery.isPending}
        isError={productGroupsQuery.isError}
      />
    </div>
  );
}
