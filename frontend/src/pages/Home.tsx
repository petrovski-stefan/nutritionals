import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import PriceTransparencySection from '@/components/home/PriceTransparencySection';
import SectionCtaLink from '@/components/home/SectionCtaLink';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import LoadingStatus from '@/components/ui/LoadingStatus';
import RetryButton from '@/components/ui/RetryButton';
import StateMessage from '@/components/ui/StateMessage';
import SupportedPharmacyCard from '@/features/pharmacies/components/SupportedPharmacyCard';
import SupportedPharmacyCardSkeleton from '@/features/pharmacies/components/SupportedPharmacyCardSkeleton';
import usePharmacies from '@/features/pharmacies/hooks/usePharmacies';
import BestDealGroupCard from '@/features/products/components/BestDealGroupCard';
import BestDealGroupCardSkeleton from '@/features/products/components/BestDealGroupCardSkeleton';
import CategoryChips from '@/features/products/components/CategoryChips';
import CategoryChipsSkeleton from '@/features/products/components/CategoryChipsSkeleton';
import GroupOffersModal from '@/features/products/components/GroupOffersModal';
import HomeSearch from '@/features/products/components/HomeSearch';
import useDiscountedProductGroups from '@/features/products/hooks/useDiscountedProductGroups';
import type { BackendDiscountedProductGroup } from '@/features/products/types/productgroups';

// Skeleton counts approximate a typical first load of each section
const SKELETON_DEAL_CARDS = 6;
const SKELETON_PHARMACY_CARDS = 4;

// Below sm the deals stack two per row; past this many they turn into a long scroll
const MOBILE_VISIBLE_DEALS = 6;

export default function Home() {
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

  return (
    <div>
      <title>Nutriceni | Агрегатор за цени на суплементи</title>

      <Section center={true}>
        <h1 className="text-text text-center text-2xl font-bold sm:text-3xl">
          Пронајдете ги најдобрите цени на суплементи од локалните аптеки.
        </h1>
        <p className="text-text-muted mt-4 text-center text-lg">
          Споредете ги понудите веднаш и заштедете на она што ви е потребно.
        </p>
      </Section>

      <Section center={true}>
        <HomeSearch />

        <div className="mt-3 text-center">
          <Link
            to="/smart-search"
            className="text-text-muted hover:text-primary focus-visible:outline-primary rounded text-sm transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
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
