import { useEffect, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HomePageProduct from './BestDealProduct';
import Section from '../../components/Section';
import PharmacyCard from './SupportedPharmacyCard';
import { simulatedBestDealsData } from '../../constants/deals';
import { supportedPharmacies } from '../../constants/pharmacies';
import type { BackendProduct } from '../../types/product';
import SearchDropdown from './SearchDropdown';
import * as ProductAPI from '../../api/products';
import { SearchIcon } from 'lucide-react';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState<boolean>(false);
  const [products, setProducts] = useState<Array<BackendProduct>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery.length < 2) {
      if (isSearchDropdownOpen) {
        setIsSearchDropdownOpen(false);
      }
      return;
    }

    const search = async (query: string) => {
      setIsLoading(true);
      const response = await ProductAPI.searchProducts(query);

      if (response.status) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
      setIsLoading(false);
    };

    search(searchQuery);
    setIsSearchDropdownOpen(true);
  }, [searchQuery]);

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery === '') {
      return;
    }

    navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    setSearchQuery('');
  };

  const handleKeyDownEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'ENTER') {
      return;
    }
    if (searchQuery === '') {
      return;
    }

    navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    setSearchQuery('');
  };

  const bestDealsProductsCards = simulatedBestDealsData.map((product) => (
    <HomePageProduct
      key={product.id}
      {...product}
    />
  ));

  const supportedPharmaciesCards = supportedPharmacies.map((pharmacy) => (
    <PharmacyCard
      key={pharmacy.name}
      {...pharmacy}
    />
  ));

  return (
    <div className="bg-neutral min-h-[70vh]">
      <Section>
        <h1 className="text-dark text-3xl font-bold">
          Find the best prices on supplements in your local pharmacies.
        </h1>
        <p className="text-dark/70 mt-[5vh] text-lg">
          Compare deals instantly and save on what matters to you.
        </p>
      </Section>

      <Section>
        <form
          className="relative mx-auto flex max-w-3xl justify-around rounded-2xl px-6 py-2"
          onSubmit={(e) => handleFormSubmit(e)}
        >
          <input
            className="w-[70%] rounded-2xl bg-neutral-200 p-4 outline-none"
            type="text"
            name="query"
            placeholder="Ex. vitamin c ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => handleKeyDownEnter(e)}
          />
          <button
            className="border-accent bg-accent absolute top-1/5 right-36 h-[60%] w-[10%] cursor-pointer rounded-3xl border-2 p-2 font-bold text-white"
            type="submit"
          >
            <SearchIcon />
          </button>
          {isSearchDropdownOpen && (
            <SearchDropdown
              products={products}
              loading={isLoading}
            />
          )}
        </form>
        <div className="mt-[3vh]">
          <Link
            to="/smart-search"
            className="hover:decoration-accent text-dark/70 text-sm italic hover:underline"
          >
            Try AI-assisted search.
          </Link>
        </div>
      </Section>

      <Section>
        <p className="flex justify-center p-4 text-2xl font-bold">Best deals this week</p>
        <div className="mt-[5vh] flex justify-around">{bestDealsProductsCards}</div>
      </Section>

      <Section>
        <p className="flex justify-center p-4 text-2xl font-bold">Supported pharmacies currently</p>
        <div className="mt-[5vh] flex justify-around">{supportedPharmaciesCards}</div>
      </Section>
    </div>
  );
}
