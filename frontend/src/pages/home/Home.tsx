import { useEffect, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BestDealsProductCard from './BestDealProductCard';
import Section from '../../components/Section';
import SupportedPharmacyCard from './SupportedPharmacyCard';
import type { BackendProduct } from '../../types/product';
import SearchDropdown from './SearchDropdown';
import ProductService from '../../api/product';
import { SearchIcon, XIcon } from 'lucide-react';
import PharmacyService from '../../api/pharmacy';
import type { BackendPharmacy } from '../../types/pharmacy';
import HOME_TEXT from '../../locale/home';
import Tooltip from '../../components/Tooltip';

const defaultErrors = {
  search: null,
  productsOnDiscount: null,
  pharmacies: null,
};

const defaultLoadings = {
  search: false,
  productsOnDiscount: false,
  pharmacies: false,
};

type Error = 'noProductsFoundError' | 'unexpectedError';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [productsOnDiscount, setProductsOnDiscount] = useState<BackendProduct[]>([]);
  const [pharmacies, setPharmacies] = useState<BackendPharmacy[]>([]);
  const [isLoadings, setIsLoadings] = useState(defaultLoadings);
  const [errors, setErrors] = useState(defaultErrors);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      handleErrorsChange('productsOnDiscount', null);
      handleErrorsChange('pharmacies', null);
      handleIsLoadingsChange('pharmacies', true);
      handleIsLoadingsChange('productsOnDiscount', true);

      try {
        const pharmaciesResponse = await PharmacyService.getPharmacies();
        const productsOnDiscountResponse = await ProductService.getProductsOnDiscount();

        if (pharmaciesResponse.status) setPharmacies(pharmaciesResponse.data);
        else handleErrorsChange('pharmacies', 'unexpectedError');

        if (productsOnDiscountResponse.status)
          setProductsOnDiscount(productsOnDiscountResponse.data);
        else handleErrorsChange('productsOnDiscount', 'unexpectedError');
      } catch (error) {
        handleErrorsChange('pharmacies', 'unexpectedError');
        handleErrorsChange('productsOnDiscount', 'unexpectedError');
      } finally {
        handleIsLoadingsChange('pharmacies', false);
        handleIsLoadingsChange('productsOnDiscount', false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setIsSearchDropdownOpen(false);
      setProducts([]);
      handleErrorsChange('search', null);
      return;
    }

    const searchProducts = async (query: string) => {
      handleIsLoadingsChange('search', true);
      handleErrorsChange('search', null);

      try {
        const response = await ProductService.searchProducts(query, 20);

        if (response.status) {
          if (response.data.length > 0) {
            setProducts(response.data);
          } else {
            setProducts([]);
            handleErrorsChange('search', 'noProductsFoundError');
          }
        } else {
          setProducts([]);
          handleErrorsChange('search', 'unexpectedError');
        }
      } catch (error) {
        setProducts([]);
        handleErrorsChange('search', 'unexpectedError');
      } finally {
        handleIsLoadingsChange('search', false);
      }
    };

    searchProducts(searchQuery);
    setIsSearchDropdownOpen(true);
  }, [searchQuery]);

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    setSearchQuery('');
  };

  const handleKeyDownEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    if (!searchQuery) return;
    navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    setSearchQuery('');
  };

  const handleIsLoadingsChange = (key: keyof typeof defaultLoadings, value: boolean) => {
    setIsLoadings((prev) => ({ ...prev, [key]: value }));
  };

  const handleErrorsChange = (key: keyof typeof defaultErrors, value: Error | null) => {
    setErrors((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-neutral min-h-screen">
      {/* Hero Section */}
      <Section center={true}>
        <h1 className="text-dark text-center text-3xl font-bold">{HOME_TEXT['hero']['h1']}</h1>
        <p className="text-dark/70 mt-5 text-center text-lg">{HOME_TEXT['hero']['p']}</p>
      </Section>

      {/* Search Section */}
      <Section center={true}>
        <form
          className="relative mx-auto flex w-full max-w-3xl items-center rounded-3xl bg-white px-4 py-2 shadow-md"
          onSubmit={handleFormSubmit}
        >
          <input
            className="focus:ring-accent focus:border-accent flex-1 rounded-2xl bg-white px-4 py-3 transition outline-none focus:ring-2"
            type="text"
            placeholder={HOME_TEXT['form']['placeholder']}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDownEnter}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-dark/50 hover:text-dark absolute top-1/2 right-20 -translate-y-1/2 cursor-pointer"
            >
              <Tooltip text="Исчисти пребарување">
                <XIcon className="h-6 w-6" />
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

          {isSearchDropdownOpen && (
            <SearchDropdown
              products={products}
              isLoading={isLoadings['search']}
              error={errors['search']}
            />
          )}
        </form>
        <div className="mt-3 text-center">
          <Link
            to="/smart-search"
            className="hover:decoration-accent text-dark/70 text-sm italic hover:underline"
          >
            {HOME_TEXT['form']['tryAISearch']}
          </Link>
        </div>
      </Section>

      {/* Products on Discount */}
      <Section center={false}>
        <h1 className="flex justify-center p-4 text-2xl font-bold">
          {HOME_TEXT['productsOnDiscount']['h1']}
        </h1>

        {/* Data */}
        {!isLoadings['productsOnDiscount'] &&
          !errors['productsOnDiscount'] &&
          productsOnDiscount.length > 0 && (
            <div className="mt-5 flex flex-wrap justify-center gap-5">
              {productsOnDiscount.map((product) => (
                <BestDealsProductCard
                  key={product.id}
                  discountPrice={product.discount_price}
                  pharmacyName={product.pharmacy}
                  {...product}
                />
              ))}
            </div>
          )}

        {/* No data */}
        {!isLoadings['productsOnDiscount'] &&
          !errors['productsOnDiscount'] &&
          productsOnDiscount.length === 0 && (
            <p className="text-dark/70 mt-5 text-center text-sm">
              {HOME_TEXT['productsOnDiscount']['noProductsOnDiscount']}
            </p>
          )}

        {/* Error */}
        {!isLoadings['productsOnDiscount'] && errors['productsOnDiscount'] && (
          <p className="text-dark/70 mt-5 text-center text-sm">
            {HOME_TEXT['productsOnDiscount'][errors['productsOnDiscount']]}
          </p>
        )}

        {/* Loading */}
        {isLoadings['productsOnDiscount'] && (
          <p className="text-dark/70 mt-5 text-center text-sm">
            {HOME_TEXT['productsOnDiscount']['loading']}
          </p>
        )}
      </Section>

      {/* Supported Pharmacies */}
      <Section center={false}>
        <h1 className="flex justify-center p-4 text-2xl font-bold">
          {HOME_TEXT['supportedPharmacies']['h1']}
        </h1>

        {/* Data */}
        {!isLoadings['pharmacies'] && !errors['pharmacies'] && (
          <div className="mt-5 flex flex-wrap justify-center gap-5">
            {pharmacies.map((pharmacy) => (
              <SupportedPharmacyCard
                key={pharmacy.id}
                {...pharmacy}
              />
            ))}
          </div>
        )}

        {/* Loading */}
        {isLoadings['pharmacies'] && (
          <p className="text-dark/70 mt-5 text-center text-sm">
            {HOME_TEXT['supportedPharmacies']['loading']}
          </p>
        )}

        {/* Error */}
        {!isLoadings['pharmacies'] && errors['pharmacies'] && (
          <p className="text-dark/70 mt-5 text-center text-sm">
            {HOME_TEXT['supportedPharmacies'][errors['pharmacies']]}
          </p>
        )}
      </Section>
    </div>
  );
}
