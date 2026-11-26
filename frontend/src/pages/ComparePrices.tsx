import { type FormEvent, useState } from 'react';

import SkipLink from '@/components/ui/SkipLink';
import FiltersSidebar from '@/features/products/components/FiltersSidebar';
import ProductsGrid from '@/features/products/components/ProductsGrid';
import useCompareSearchParams from '@/features/products/hooks/useCompareSearchParams';
import useProductGroups from '@/features/products/hooks/useProductGroups';
import { MIN_SEARCH_QUERY_LENGTH } from '@/features/products/schemas';
import type { GroupFilterValue } from '@/features/products/types/productgroups';

const filtersDefault: GroupFilterValue = {
  brandIds: [],
  categoryIds: [],
};

const PAGE_SIZE = 6;

export default function ComparePrices() {
  const {
    query: submittedQuery,
    filters,
    page: currentPage,
    updateSearchParams,
  } = useCompareSearchParams();

  // The input is a draft; the URL holds the submitted search
  const [searchQuery, setSearchQuery] = useState(submittedQuery);
  const [syncedQuery, setSyncedQuery] = useState(submittedQuery);
  const [showLengthHint, setShowLengthHint] = useState(false);

  // Keep the input in step when the URL changes underneath it (Back/Forward, "show all" from Home)
  if (syncedQuery !== submittedQuery) {
    setSyncedQuery(submittedQuery);
    setSearchQuery(submittedQuery);
  }

  const productGroupsQuery = useProductGroups(submittedQuery, filters, currentPage);

  const groups = productGroupsQuery.data?.results ?? [];
  const totalCount = productGroupsQuery.data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleFilterChange = (key: keyof GroupFilterValue, value: number, isChecked: boolean) => {
    const ids = isChecked ? [...filters[key], value] : filters[key].filter((v) => v !== value);
    updateSearchParams({ filters: { ...filters, [key]: ids }, page: 1 });
  };

  const handleSearchFormSubmit = (e: FormEvent) => {
    e.preventDefault();

    const query = searchQuery.trim();
    if (query.length < MIN_SEARCH_QUERY_LENGTH) {
      setShowLengthHint(true);
      return;
    }
    setShowLengthHint(false);

    if (query === submittedQuery && currentPage === 1) {
      // Same URL, so react-query won't refetch on its own, but submit should always re-search
      void productGroupsQuery.refetch();
      return;
    }
    updateSearchParams({ query, page: 1 });
  };

  const handleClearInputSearchQuery = () => {
    setSearchQuery('');
    setShowLengthHint(false);
    if (submittedQuery !== '') updateSearchParams({ query: '', page: 1 });
  };

  // Back to page 1: the old page number may not exist once the filters change
  const handleClearFilters = () => {
    updateSearchParams({ filters: filtersDefault, page: 1 });
  };

  const handleResetSearch = () => {
    setSearchQuery('');
    updateSearchParams({ query: '', filters: filtersDefault, page: 1 });
  };

  const hasActiveSearch =
    submittedQuery !== '' || filters.brandIds.length > 0 || filters.categoryIds.length > 0;

  const handleClickPagination = (back: boolean) => {
    const nextPage = back ? currentPage - 1 : currentPage + 1;
    if (nextPage < 1 || nextPage > totalPages) return;

    updateSearchParams({ page: nextPage });
    // Otherwise the next page opens where the old one was scrolled to: at its bottom
    window.scrollTo(0, 0);
  };

  return (
    <div className="relative mx-auto grid w-full max-w-[96rem] items-start gap-6 px-4 py-8 sm:px-6 md:grid-cols-[280px_1fr]">
      <title>Спореди цени | Nutriceni</title>

      <h1 className="text-text text-2xl font-bold sm:text-3xl md:col-span-2">Спореди цени</h1>

      {/* Keyboard users would otherwise tab through every filter before reaching a result */}
      <SkipLink
        targetId="compare-results"
        className="focus:absolute focus:top-2 focus:left-4 focus:z-10"
      >
        Прескокни до резултатите
      </SkipLink>

      <FiltersSidebar
        handleSearchFormSubmit={handleSearchFormSubmit}
        inputSearchQuery={searchQuery}
        setInputSearchQuery={(value) => {
          setSearchQuery(value);
          setShowLengthHint(false);
        }}
        showLengthHint={showLengthHint}
        handleFilterValueChange={handleFilterChange}
        handleClearInputSearchQuery={handleClearInputSearchQuery}
        filters={filters}
        handleClearFilters={handleClearFilters}
      />

      <ProductsGrid
        groups={groups}
        totalCount={totalCount}
        query={submittedQuery}
        totalPages={totalPages}
        currentPage={currentPage}
        handlePaginationClick={handleClickPagination}
        isPending={productGroupsQuery.isPending}
        isError={productGroupsQuery.isError}
        isRefetching={productGroupsQuery.isFetching}
        handleRetry={() => {
          void productGroupsQuery.refetch();
        }}
        hasActiveSearch={hasActiveSearch}
        handleResetSearch={handleResetSearch}
      />
    </div>
  );
}
