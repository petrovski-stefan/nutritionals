import { SearchIcon, XIcon, FilterIcon } from 'lucide-react';
import Section from '../../components/Section';
import SmartSearchResultsModal from './SmartSearchResultsModal';
import ProductService from '../../api/product';
import { useEffect, useState, type FormEvent } from 'react';
import type { BackendProduct } from '../../types/product';
import SMART_SEARCH_TEXT from '../../locale/smart-search';
import Tooltip from '../../components/Tooltip';
import type { BackendPharmacy } from '../../types/pharmacy';
import type { BackendCategory } from '../../types/category';
import PharmacyService from '../../api/pharmacy';
import CategoryService from '../../api/category';
import type { IsLoading, Error } from './types';

const defaultError: Error = {
  search: null,
  productToMyList: null,
  myLists: null,
  createNewMyList: null,
  categories: null,
  pharmacies: null,
};

const defaultLoading: IsLoading = {
  search: false,
  categories: false,
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
  const [categoryOptions, setCategoryOptions] = useState<BackendCategory[]>([]);

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
        handleIsLoadingChange('categories', true);

        const pharmaciesResponse = await PharmacyService.getPharmacies();
        const categoriesResponse = await CategoryService.getCategories();

        if (pharmaciesResponse.status) {
          setPharmacyOptions(pharmaciesResponse.data);
        }

        if (categoriesResponse.status) {
          setCategoryOptions(categoriesResponse.data);
        }
      } catch (error) {
        handleErrorChange('pharmacies', 'unexpectedError');
        handleErrorChange('categories', 'unexpectedError');
      } finally {
        handleIsLoadingChange('pharmacies', false);
        handleIsLoadingChange('categories', false);
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

  const { categories: categoriesError, pharmacies: pharmaciesError } = error;
  const { categories: categoriesIsLoading, pharmacies: pharmaciesIsLoading } = isLoading;

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
          <div className="flex w-full items-center">
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
                className="text-dark/50 hover:text-dark absolute top-1/2 right-20 -translate-y-1/2 cursor-pointer transition"
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
            <div className="mt-3 flex justify-around gap-4 sm:flex-row">
              <div className="flex flex-col">
                <span className="mb-1 font-medium text-gray-700">Аптеки:</span>
                {!pharmaciesIsLoading && !pharmaciesError && (
                  <ul className="flex flex-col flex-wrap gap-2">
                    {pharmacyOptions.map((pharmacy) => (
                      <li key={pharmacy.id}>
                        <label
                          key={pharmacy.id}
                          className="flex items-center gap-1"
                        >
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
                          <span className="text-gray-700">{pharmacy.name}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex flex-col">
                <span className="mb-1 font-medium text-gray-700">Категории:</span>
                {!categoriesIsLoading && !categoriesError && (
                  <ul className="flex flex-col flex-wrap gap-2">
                    {categoryOptions.map((category) => (
                      <li key={category.id}>
                        <label
                          key={category.id}
                          className="flex items-center gap-1"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category.id)}
                            onChange={() =>
                              toggleSelection(
                                category.id,
                                selectedCategories,
                                setSelectedCategories
                              )
                            }
                            className="accent-accent h-4 w-4 rounded border-gray-300"
                          />
                          <span className="text-gray-700">{category.name}</span>
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
