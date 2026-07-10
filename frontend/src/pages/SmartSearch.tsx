import { zodResolver } from '@hookform/resolvers/zod';
import { FilterIcon, SearchIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import Section from '../components/layout/Section';
import Card from '../components/ui/Card';
import Checkbox from '../components/ui/Checkbox';
import IconButton from '../components/ui/IconButton';
import Input from '../components/ui/Input';
import Tooltip from '../components/ui/Tooltip';
import usePharmacies from '../features/pharmacies/hooks/usePharmacies';
import SmartSearchResultsModal from '../features/products/components/SmartSearchResultsModal';
import useSmartSearchProducts from '../features/products/hooks/useSmartSearchProducts';
import SMART_SEARCH_TEXT from '../features/products/locale/smart-search';
import { type SmartSearchFormFields, SmartSearchSchema } from '../features/products/schemas';

export default function SmartSearch() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [selectedPharmacies, setSelectedPharmacies] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const pharmaciesQuery = usePharmacies();
  const smartSearch = useSmartSearchProducts();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<SmartSearchFormFields>({
    resolver: zodResolver(SmartSearchSchema),
    defaultValues: { query: '' },
  });

  const inputSearchQuery = watch('query');

  const onSubmit = (data: SmartSearchFormFields) => {
    smartSearch.mutate({
      query: data.query,
      pharmacyIds: selectedPharmacies,
      categoryIds: selectedCategories,
    });
    setIsModalOpen(true);
  };

  const handleResultsModalOnClose = () => {
    setIsModalOpen(false);
    reset();
    setSelectedPharmacies([]);
    setSelectedCategories([]);
    setShowFilters(false);
    smartSearch.reset();
  };

  const toggleSelection = (value: number, list: number[], setList: (arr: number[]) => void) => {
    if (list.includes(value)) {
      setList(list.filter((item) => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  const pharmacyOptions = pharmaciesQuery.data ?? [];

  return (
    <div className="flex flex-col items-center">
      <Section>
        <h1 className="text-text mx-auto max-w-2xl text-center text-lg font-semibold sm:text-xl md:text-2xl">
          {SMART_SEARCH_TEXT['hero']['h1']}
        </h1>
      </Section>

      <Section>
        <Card className="mx-auto w-full max-w-3xl p-3">
          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
            <div className="flex w-full items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder={SMART_SEARCH_TEXT['form']['placeholder']}
                  maxLength={100}
                  className="pr-11"
                  {...register('query')}
                />

                {inputSearchQuery && (
                  <Tooltip text="Исчисти пребарување">
                    <IconButton
                      label="Исчисти пребарување"
                      size="sm"
                      className="absolute top-1/2 right-2 -translate-y-1/2"
                      onClick={() => {
                        reset();
                      }}
                    >
                      <XIcon className="h-4 w-4" />
                    </IconButton>
                  </Tooltip>
                )}
              </div>

              <Tooltip text="Пребарувај">
                <IconButton
                  label="Пребарувај"
                  variant="filled"
                  type="submit"
                >
                  <SearchIcon className="h-5 w-5" />
                </IconButton>
              </Tooltip>

              <Tooltip text="Филтри">
                <IconButton
                  label="Филтри"
                  aria-expanded={showFilters}
                  onClick={() => {
                    setShowFilters(!showFilters);
                  }}
                >
                  <FilterIcon className="h-5 w-5" />
                </IconButton>
              </Tooltip>
            </div>

            {errors.query?.message && (
              <p className="text-danger mt-2 px-1 text-sm font-medium">{errors.query.message}</p>
            )}

            {showFilters && (
              <div className="border-border mt-3 flex w-full flex-col items-center gap-3 border-t pt-3">
                <span className="text-text font-medium">Аптеки:</span>

                {pharmaciesQuery.isSuccess && (
                  <ul className="flex flex-col flex-wrap justify-center gap-x-5 gap-y-2 md:flex-row">
                    {pharmacyOptions.map((pharmacy) => (
                      <li key={pharmacy.id}>
                        <Checkbox
                          label={pharmacy.name}
                          checked={selectedPharmacies.includes(pharmacy.id)}
                          onChange={() => {
                            toggleSelection(pharmacy.id, selectedPharmacies, setSelectedPharmacies);
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </form>
        </Card>
      </Section>

      <Section>
        <p className="text-text-muted mx-auto max-w-lg text-center text-sm">
          {SMART_SEARCH_TEXT['warning']['h1']}
        </p>
      </Section>

      {isModalOpen && (
        <SmartSearchResultsModal
          query={smartSearch.variables?.query ?? ''}
          products={smartSearch.data ?? []}
          isPending={smartSearch.isPending}
          isError={smartSearch.isError}
          onClose={handleResultsModalOnClose}
        />
      )}
    </div>
  );
}
