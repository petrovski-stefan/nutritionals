import { zodResolver } from '@hookform/resolvers/zod';
import { FilterIcon, SearchIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import Section from '../components/layout/Section';
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
    <div className="bg-neutral/50 flex flex-col items-center px-4 py-12">
      <Section>
        <h1 className="text-dark mx-auto max-w-2xl text-center text-lg sm:text-xl md:text-2xl">
          {SMART_SEARCH_TEXT['hero']['h1']}
        </h1>
      </Section>

      <Section>
        <form
          onSubmit={(e) => void handleSubmit(onSubmit)(e)}
          className="relative mx-auto flex w-full max-w-3xl flex-col rounded-3xl bg-white px-4 py-2 shadow-md"
        >
          <div className="relative flex w-full items-center">
            <input
              type="text"
              placeholder={SMART_SEARCH_TEXT['form']['placeholder']}
              maxLength={100}
              {...register('query')}
              className="focus:ring-accent focus:border-accent flex-1 rounded-2xl bg-white px-4 py-3 transition outline-none focus:ring-2"
            />

            {inputSearchQuery && (
              <button
                type="button"
                onClick={() => {
                  reset();
                }}
                className="text-dark/50 hover:text-dark absolute right-20 cursor-pointer transition md:top-1/2 md:right-32 md:-translate-y-1/3"
              >
                <Tooltip text="Исчисти пребарување">
                  <XIcon className="h-5 w-5" />
                </Tooltip>
              </button>
            )}

            <button
              type="submit"
              className="bg-accent hover:bg-accent/90 ml-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white transition"
            >
              <Tooltip text="Пребарувај">
                <SearchIcon className="h-5 w-5" />
              </Tooltip>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowFilters(!showFilters);
              }}
              className="ml-2 flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 transition hover:bg-gray-100"
            >
              <Tooltip text="Филтри">
                <FilterIcon className="h-5 w-5 text-gray-600" />
              </Tooltip>
            </button>
          </div>

          {errors.query?.message && (
            <p className="mt-2 px-4 text-sm font-medium text-red-600">{errors.query.message}</p>
          )}

          {showFilters && (
            <div className="mt-3 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-between">
              <div className="flex w-full flex-col items-center">
                <span className="mb-1 font-medium text-gray-700">Аптеки:</span>
                {pharmaciesQuery.isSuccess && (
                  <ul className="flex flex-col flex-wrap gap-2 md:flex-row">
                    {pharmacyOptions.map((pharmacy) => (
                      <li
                        key={pharmacy.id}
                        className="flex justify-center"
                      >
                        <label
                          key={pharmacy.id}
                          className="flex items-center gap-1"
                        >
                          <span className="text-gray-700">{pharmacy.name}</span>
                          <input
                            type="checkbox"
                            checked={selectedPharmacies.includes(pharmacy.id)}
                            onChange={() => {
                              toggleSelection(
                                pharmacy.id,
                                selectedPharmacies,
                                setSelectedPharmacies
                              );
                            }}
                            className="accent-accent h-4 w-4 rounded border-gray-300"
                          />
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </form>
      </Section>

      <Section>
        <h1 className="text-dark/70 mx-auto max-w-lg text-center">
          {SMART_SEARCH_TEXT['warning']['h1']}
        </h1>
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
