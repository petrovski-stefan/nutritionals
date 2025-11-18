import { useEffect, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BestDealsProductCard from './BestDealProductCard';
import Section from '../../components/Section';
import SupportedPharmacyCard from './SupportedPharmacyCard';
import type { BackendProduct } from '../../types/product';
import SearchDropdown from './SearchDropdown';
import ProductService from '../../api/product';
import { SearchIcon, X } from 'lucide-react';
import PharmacyService from '../../api/pharmacy';
import type { BackendPharmacy } from '../../types/pharmacy';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [productsOnDiscount, setProductsOnDiscount] = useState<BackendProduct[]>([]);
  const [pharmacies, setPharmacies] = useState<BackendPharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPharmacies = async () => {
      const response = await PharmacyService.getPharmacies();
      if (response.status) setPharmacies(response.data);
    };
    const fetchProductsOnDiscount = async () => {
      const response = await ProductService.getProductsOnDiscount();
      if (response.status) setProductsOnDiscount(response.data);
    };
    fetchPharmacies();
    fetchProductsOnDiscount();
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setIsSearchDropdownOpen(false);
      return;
    }

    const search = async (query: string) => {
      setIsLoading(true);
      const response = await ProductService.searchProducts(query, 20);
      if (response.status) setProducts(response.data);
      else setProducts([]);
      setIsLoading(false);
    };

    search(searchQuery);
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

  return (
    <div className="bg-neutral min-h-screen">
      {/* Hero Section */}
      <Section center={true}>
        <h1 className="text-dark text-center text-3xl font-bold">
          Find the best prices on supplements in your local pharmacies.
        </h1>
        <p className="text-dark/70 mt-5 text-center text-lg">
          Compare deals instantly and save on what matters to you.
        </p>
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
            placeholder="Ex. vitamin C ..."
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
              <X />
            </button>
          )}
          <button
            type="submit"
            className="bg-accent hover:bg-accent/90 ml-4 flex h-10 w-10 items-center justify-center rounded-full text-white transition"
          >
            <SearchIcon className="h-5 w-5" />
          </button>

          {isSearchDropdownOpen && (
            <SearchDropdown
              products={products}
              loading={isLoading}
            />
          )}
        </form>
        <div className="mt-3 text-center">
          <Link
            to="/smart-search"
            className="hover:decoration-accent text-dark/70 text-sm italic hover:underline"
          >
            Try AI-assisted search.
          </Link>
        </div>
      </Section>

      {/* Products on Discount */}
      <Section center={false}>
        <p className="flex justify-center p-4 text-2xl font-bold">Products on discount</p>
        {productsOnDiscount.length > 0 ? (
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
        ) : (
          <p className="text-dark/70 mt-5 text-center text-sm">
            No products on discount. Check again tomorrow.
          </p>
        )}
      </Section>

      {/* Supported Pharmacies */}
      <Section center={false}>
        <p className="flex justify-center p-4 text-2xl font-bold">Supported pharmacies currently</p>
        <div className="mt-5 flex flex-wrap justify-center gap-5">
          {pharmacies.map((pharmacy) => (
            <SupportedPharmacyCard
              key={pharmacy.id}
              {...pharmacy}
            />
          ))}
        </div>
      </Section>
    </div>
  );
}
