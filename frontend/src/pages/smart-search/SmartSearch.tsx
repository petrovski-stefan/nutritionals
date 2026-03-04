import { SearchIcon, XIcon, FilterIcon } from 'lucide-react';
import Section from '../../components/Section';
import SmartSearchResultsModal from './SmartSearchResultsModal';
import ProductService from '../../api/product';
import { useEffect, useState, type FormEvent } from 'react';
import type { BackendProduct } from '../../types/product';
import SMART_SEARCH_TEXT from '../../locale/smart-search';
import Tooltip from '../../components/Tooltip';
import type { BackendPharmacy } from '../../types/pharmacy';
import PharmacyService from '../../api/pharmacy';
import type { IsLoading, Error } from './types';

const defaultError: Error = {
  search: null,
  productToMyList: null,
  myLists: null,
  createNewMyList: null,
  pharmacies: null,
};

const defaultLoading: IsLoading = {
  search: false,
  pharmacies: false,
  productToMyList: false,
  myLists: false,
  createNewMyList: false,
};

export default function SmartSearch() {
  const [inputSearchQuery, setInputSearchQuery] = useState('');
  const [productResults, setProductResults] = useState<BackendProduct[]>([]);

  const [isLoading, setIsLoading] = useState(defaultLoading);
  const [error, setError] = useState(defaultError);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [selectedPharmacies, setSelectedPharmacies] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const [pharmacyOptions, setPharmacyOptions] = useState<BackendPharmacy[]>([]);

  const handleErrorChange = <K extends keyof Error>(key: K, value: Error[K]) => {
    setError((prev) => ({ ...prev, [key]: value }));
  };

  const handleIsLoadingChange = <K extends keyof IsLoading>(key: K, value: IsLoading[K]) => {
    setIsLoading((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        handleIsLoadingChange('pharmacies', true);

        const pharmaciesResponse = await PharmacyService.getPharmacies();

        if (pharmaciesResponse.status) {
          setPharmacyOptions(pharmaciesResponse.data);
        }
      } catch (error) {
        handleErrorChange('pharmacies', 'unexpectedError');
      } finally {
        handleIsLoadingChange('pharmacies', false);
      }
    };

    fetchData();
  }, []);

  const handleSearchFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputSearchQuery) return;

    setIsLoading((prev) => ({ ...prev, search: true }));
    setIsModalOpen(true);
    setError((prev) => ({ ...prev, search: null }));
    setProductResults([]);

    try {
      const response = await ProductService.smartSearchProducts(
        inputSearchQuery,
        selectedPharmacies,
        selectedCategories
      );
      if (response.status) {
        setProductResults(response.data);
      } else {
        setError((prev) => ({ ...prev, search: 'noProductsFoundError' }));
      }
    } catch (error) {
      setError((prev) => ({ ...prev, search: 'noProductsFoundError' }));
    } finally {
      setIsLoading((prev) => ({ ...prev, search: false }));
    }
  };

  const handleResultsModalOnClose = () => {
    setIsModalOpen(false);
    setInputSearchQuery('');
    setSelectedPharmacies([]);
    setSelectedCategories([]);
    setShowFilters(false);
    handleErrorChange('createNewMyList', null);
    handleErrorChange('myLists', null);
  };

  const toggleSelection = (value: number, list: number[], setList: (arr: number[]) => void) => {
    if (list.includes(value)) {
      setList(list.filter((item) => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  const { pharmacies: pharmaciesError } = error;
  const { pharmacies: pharmaciesIsLoading } = isLoading;

  return (
    <div className="bg-neutral/50 flex flex-col items-center px-4 py-12">
      <Section>
        <h1 className="text-dark mx-auto max-w-2xl text-center text-lg sm:text-xl md:text-2xl">
          {SMART_SEARCH_TEXT['hero']['h1']}
        </h1>
      </Section>

      <Section>
        <form
          onSubmit={handleSearchFormSubmit}
          className="relative mx-auto flex w-full max-w-3xl flex-col rounded-3xl bg-white px-4 py-2 shadow-md"
        >
          <div className="relative flex w-full items-center">
            <input
              type="text"
              placeholder={SMART_SEARCH_TEXT['form']['placeholder']}
              value={inputSearchQuery}
              minLength={3}
              maxLength={100}
              onChange={(e) => setInputSearchQuery(e.target.value)}
              className="focus:ring-accent focus:border-accent flex-1 rounded-2xl bg-white px-4 py-3 transition outline-none focus:ring-2"
            />

            {inputSearchQuery && (
              <button
                type="button"
                onClick={() => setInputSearchQuery('')}
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
              onClick={() => setShowFilters(!showFilters)}
              className="ml-2 flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 transition hover:bg-gray-100"
            >
              <Tooltip text="Филтри">
                <FilterIcon className="h-5 w-5 text-gray-600" />
              </Tooltip>
            </button>
          </div>

          {showFilters && (
            <div className="mt-3 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-between">
              <div className="flex w-full flex-col items-center">
                <span className="mb-1 font-medium text-gray-700">Аптеки:</span>
                {!pharmaciesIsLoading && !pharmaciesError && (
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
                            onChange={() =>
                              toggleSelection(
                                pharmacy.id,
                                selectedPharmacies,
                                setSelectedPharmacies
                              )
                            }
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
          query={inputSearchQuery}
          products={productResults}
          isLoading={isLoading}
          handleIsLoadingChange={handleIsLoadingChange}
          error={error}
          handleErrorChange={handleErrorChange}
          onClose={handleResultsModalOnClose}
        />
      )}
    </div>
  );
}
