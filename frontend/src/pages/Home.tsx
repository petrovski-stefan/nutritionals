import { ChevronDownIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import PriceTransparencySection from '@/components/home/PriceTransparencySection';
import SectionCtaLink from '@/components/home/SectionCtaLink';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import IconButton from '@/components/ui/IconButton';
import Input from '@/components/ui/Input';
import LoadingStatus from '@/components/ui/LoadingStatus';
import RetryButton from '@/components/ui/RetryButton';
import StateMessage from '@/components/ui/StateMessage';
import Tooltip from '@/components/ui/Tooltip';
import SupportedPharmacyCard from '@/features/pharmacies/components/SupportedPharmacyCard';
import SupportedPharmacyCardSkeleton from '@/features/pharmacies/components/SupportedPharmacyCardSkeleton';
import usePharmacies from '@/features/pharmacies/hooks/usePharmacies';
import BestDealGroupCard from '@/features/products/components/BestDealGroupCard';
import BestDealGroupCardSkeleton from '@/features/products/components/BestDealGroupCardSkeleton';
import CategoryChips from '@/features/products/components/CategoryChips';
import CategoryChipsSkeleton from '@/features/products/components/CategoryChipsSkeleton';
import DropdownProductGroup from '@/features/products/components/DropdownProductGroup';
import DropdownProductGroupSkeleton from '@/features/products/components/DropdownProductGroupSkeleton';
import GroupOffersModal from '@/features/products/components/GroupOffersModal';
import useDiscountedProductGroups from '@/features/products/hooks/useDiscountedProductGroups';
import useProductGroupsSearch from '@/features/products/hooks/useProductGroupsSearch';
import type { BackendDiscountedProductGroup } from '@/features/products/types/productgroups';

// Skeleton counts approximate a typical first load of each section
const SKELETON_SEARCH_ROWS = 3;
const SKELETON_DEAL_CARDS = 6;
const SKELETON_PHARMACY_CARDS = 4;

// Below sm the deals stack two per row; past this many they turn into a long scroll
const MOBILE_VISIBLE_DEALS = 6;

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [openedGroup, setOpenedGroup] = useState<BackendDiscountedProductGroup | null>(null);
  const [showAllDeals, setShowAllDeals] = useState(false);

  const handleSelectCategory = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setShowAllDeals(false);
  };

  const {
    data: pharmacies,
    isError: pharmaciesIsError,
    isPending: pharmaciesIsPending,
    isSuccess: pharmaciesIsSuccess,
    isFetching: pharmaciesIsFetching,
    refetch: refetchPharmacies,
  } = usePharmacies();

  const {
    data: discountedGroups,
    isError: discountedGroupsIsError,
    isPending: discountedGroupsIsPending,
    isSuccess: discountedGroupsIsSuccess,
    isFetching: discountedGroupsIsFetching,
    refetch: refetchDiscountedGroups,
  } = useDiscountedProductGroups(selectedCategoryId);

  const shouldSearch = searchQuery.length > 2;

  const {
    data: searchedGroups,
    isSuccess: groupsSearchIsSuccess,
    isPending: groupsSearchIsPending,
    isError: groupsSearchIsError,
    isFetching: groupsSearchIsFetching,
    refetch: refetchGroupsSearch,
  } = useProductGroupsSearch(searchQuery, shouldSearch);

  return (
    <div>
      <Section center={true}>
        <h1 className="text-text text-center text-2xl font-bold sm:text-3xl">
          Пронајдете ги најдобрите цени на суплементи од локалните аптеки.
        </h1>
        <p className="text-text-muted mt-4 text-center text-lg">
          Споредете ги понудите веднаш и заштедете на она што ви е потребно.
        </p>
      </Section>

      <Section center={true}>
        <div className="relative w-full max-w-3xl">
          <Card className="relative flex items-center p-2">
            <Input
              type="text"
              aria-label="Пребарај суплементи"
              placeholder="Пребарај суплементи..."
              value={searchQuery}
              className="border-0 pr-12 pointer-coarse:pr-16"
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
            />
            {searchQuery && (
              <div className="absolute top-1/2 right-3 -translate-y-1/2">
                <Tooltip
                  text="Исчисти пребарување"
                  placement="top"
                >
                  <IconButton
                    label="Исчисти пребарување"
                    onClick={() => {
                      setSearchQuery('');
                    }}
                  >
                    <XIcon className="h-5 w-5" />
                  </IconButton>
                </Tooltip>
              </div>
            )}
          </Card>

          {shouldSearch && (
            <div className="border-border bg-surface-raised absolute top-full left-0 z-40 mt-2 max-h-96 w-full overflow-y-auto rounded-xl border p-2 shadow-md transition duration-200 ease-out motion-reduce:transition-none starting:-translate-y-1 starting:opacity-0">
              {groupsSearchIsSuccess &&
                searchedGroups.results.length > 0 &&
                searchedGroups.results.map((group) => (
                  <DropdownProductGroup
                    key={group.id}
                    productGroup={group}
                  />
                ))}

              {groupsSearchIsSuccess && searchedGroups.results.length === 0 && (
                <StateMessage
                  variant="empty"
                  message={`Нема производи за „${searchQuery}“. Пробајте со друг збор или со паметното пребарување.`}
                />
              )}

              {groupsSearchIsPending && (
                <>
                  <LoadingStatus />
                  {Array.from({ length: SKELETON_SEARCH_ROWS }, (_, index) => (
                    <DropdownProductGroupSkeleton key={index} />
                  ))}
                </>
              )}

              {groupsSearchIsError && (
                <StateMessage variant="error">
                  <RetryButton
                    onRetry={() => {
                      void refetchGroupsSearch();
                    }}
                    isRetrying={groupsSearchIsFetching}
                  />
                </StateMessage>
              )}
            </div>
          )}
        </div>

        <div className="mt-3 text-center">
          <Link
            to="/smart-search"
            className="text-text-muted hover:text-primary focus-visible:outline-primary rounded text-sm italic transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Не најдовте тоа што ви треба? Обидете се со паметното пребарување!
          </Link>
        </div>
      </Section>

      <Section
        center={false}
        title="Суплементи со најголемо намалување"
      >
        {discountedGroupsIsSuccess && (
          <CategoryChips
            categories={discountedGroups.categories}
            selectedCategoryId={selectedCategoryId}
            onSelect={handleSelectCategory}
          />
        )}

        {discountedGroupsIsSuccess && discountedGroups.results.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-center sm:gap-5">
              {discountedGroups.results.map((group, index) => (
                <BestDealGroupCard
                  key={group.id}
                  group={group}
                  onOpenOffers={setOpenedGroup}
                  className={!showAllDeals && index >= MOBILE_VISIBLE_DEALS ? 'max-sm:hidden' : ''}
                />
              ))}
            </div>

            {!showAllDeals && discountedGroups.results.length > MOBILE_VISIBLE_DEALS && (
              <Button
                variant="outline"
                className="mt-4 w-full sm:hidden"
                onClick={() => {
                  setShowAllDeals(true);
                }}
              >
                Прикажи ги сите {discountedGroups.results.length} попусти
                <ChevronDownIcon
                  aria-hidden="true"
                  className="h-4 w-4"
                />
              </Button>
            )}
          </>
        )}

        {discountedGroupsIsSuccess && discountedGroups.results.length === 0 && (
          <StateMessage
            variant="empty"
            message="Денес нема суплементи на попуст. Цените се ажурираат секој ден."
          >
            <SectionCtaLink to="/compare">Спореди ги сите цени</SectionCtaLink>
          </StateMessage>
        )}

        {discountedGroupsIsPending && (
          <>
            <LoadingStatus />
            <CategoryChipsSkeleton />
            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-center sm:gap-5">
              {Array.from({ length: SKELETON_DEAL_CARDS }, (_, index) => (
                <BestDealGroupCardSkeleton key={index} />
              ))}
            </div>
          </>
        )}

        {discountedGroupsIsError && (
          <StateMessage variant="error">
            <RetryButton
              onRetry={() => {
                void refetchDiscountedGroups();
              }}
              isRetrying={discountedGroupsIsFetching}
            />
          </StateMessage>
        )}
      </Section>

      {openedGroup !== null && (
        <GroupOffersModal
          group={openedGroup}
          onClose={() => {
            setOpenedGroup(null);
          }}
        />
      )}

      <PriceTransparencySection />

      <Section
        center={false}
        title="Поддржани аптеки од системот"
      >
        {pharmaciesIsSuccess && (
          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-center sm:gap-5">
            {pharmacies.map((pharmacy) => (
              <SupportedPharmacyCard
                key={pharmacy.id}
                {...pharmacy}
              />
            ))}
          </div>
        )}

        {pharmaciesIsSuccess && pharmacies.length === 0 && (
          <StateMessage
            variant="empty"
            message="Моментално нема поддржани аптеки."
          />
        )}

        {pharmaciesIsPending && (
          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-center sm:gap-5">
            <LoadingStatus />
            {Array.from({ length: SKELETON_PHARMACY_CARDS }, (_, index) => (
              <SupportedPharmacyCardSkeleton key={index} />
            ))}
          </div>
        )}

        {pharmaciesIsError && (
          <StateMessage variant="error">
            <RetryButton
              onRetry={() => {
                void refetchPharmacies();
              }}
              isRetrying={pharmaciesIsFetching}
            />
          </StateMessage>
        )}
      </Section>
    </div>
  );
}
