import { XIcon } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import PriceTransparencySection from '@/components/home/PriceTransparencySection';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import IconButton from '@/components/ui/IconButton';
import Input from '@/components/ui/Input';
import StateMessage from '@/components/ui/StateMessage';
import Tooltip from '@/components/ui/Tooltip';
import SupportedPharmacyCard from '@/features/pharmacies/components/SupportedPharmacyCard';
import usePharmacies from '@/features/pharmacies/hooks/usePharmacies';
import BestDealGroupCard from '@/features/products/components/BestDealGroupCard';
import CategoryChips from '@/features/products/components/CategoryChips';
import DropdownProductGroup from '@/features/products/components/DropdownProductGroup';
import GroupOffersModal from '@/features/products/components/GroupOffersModal';
import useDiscountedProductGroups from '@/features/products/hooks/useDiscountedProductGroups';
import useProductGroupsSearch from '@/features/products/hooks/useProductGroupsSearch';
import type { BackendDiscountedProductGroup } from '@/features/products/types/productgroups';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [openedGroup, setOpenedGroup] = useState<BackendDiscountedProductGroup | null>(null);

  const {
    data: pharmacies,
    isError: pharmaciesIsError,
    isPending: pharmaciesIsPending,
    isSuccess: pharmaciesIsSuccess,
  } = usePharmacies();

  const {
    data: discountedGroups,
    isError: discountedGroupsIsError,
    isPending: discountedGroupsIsPending,
    isSuccess: discountedGroupsIsSuccess,
  } = useDiscountedProductGroups(selectedCategoryId);

  const shouldSearch = searchQuery.length > 2;

  const {
    data: searchedGroups,
    isSuccess: groupsSearchIsSuccess,
    isPending: groupsSearchIsPending,
    isError: groupsSearchIsError,
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
              placeholder="Пребарај суплементи..."
              value={searchQuery}
              className="border-0 pr-12"
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
            <div className="border-border bg-surface-raised absolute top-full left-0 z-40 mt-2 max-h-96 w-full overflow-y-auto rounded-xl border p-2 shadow-md">
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
                  message="Не беа пронајдени производи со вашето пребарување. Обидете се повторно."
                />
              )}

              {groupsSearchIsPending && <StateMessage variant="loading" />}

              {groupsSearchIsError && <StateMessage variant="error" />}
            </div>
          )}
        </div>

        <div className="mt-3 text-center">
          <Link
            to="/smart-search"
            className="text-text-muted hover:text-accent focus-visible:outline-primary rounded text-sm italic transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
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
            onSelect={setSelectedCategoryId}
          />
        )}

        {discountedGroupsIsSuccess && discountedGroups.results.length > 0 && (
          <div className="flex flex-wrap justify-center gap-5">
            {discountedGroups.results.map((group) => (
              <BestDealGroupCard
                key={group.id}
                group={group}
                onOpenOffers={setOpenedGroup}
              />
            ))}
          </div>
        )}

        {discountedGroupsIsSuccess && discountedGroups.results.length === 0 && (
          <StateMessage
            variant="empty"
            message="Денес нема суплементи на попуст. Проверете утре повторно."
          />
        )}

        {discountedGroupsIsPending && <StateMessage variant="loading" />}

        {discountedGroupsIsError && <StateMessage variant="error" />}
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
          <div className="flex flex-wrap justify-center gap-5">
            {pharmacies.map((pharmacy) => (
              <SupportedPharmacyCard
                key={pharmacy.id}
                {...pharmacy}
              />
            ))}
          </div>
        )}

        {pharmaciesIsPending && <StateMessage variant="loading" />}

        {pharmaciesIsError && <StateMessage variant="error" />}
      </Section>
    </div>
  );
}
