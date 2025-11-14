import { SearchIcon, XIcon } from 'lucide-react';
import Section from '../../components/Section';
import SmartSearchResultsModal from './SmartSearchResultsModal';
import ProductService from '../../api/product';
import { useState, type FormEvent } from 'react';
import type { BackendProduct } from '../../types/product';

export default function SmartSearch() {
  const [inputSearchQuery, setInputSearchQuery] = useState('');
  const [productResults, setProductResults] = useState<BackendProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearchFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputSearchQuery) return;

    setIsLoading(true);
    setIsModalOpen(true);
    setProductResults([]);

    try {
      const response = await ProductService.smartSearchProducts(inputSearchQuery);
      if (response.status) {
        setProductResults(response.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-neutral/50 flex flex-col items-center px-4 py-12">
      {/* Hero */}
      <Section>
        <h1 className="text-dark mx-auto max-w-2xl text-center text-lg sm:text-xl md:text-2xl">
          Describe your goal or concern, and our AI will find the best supplements for you.
        </h1>
      </Section>

      {/* Form */}
      <Section>
        <form
          onSubmit={handleSearchFormSubmit}
          className="relative mx-auto flex w-full max-w-3xl items-center rounded-3xl bg-white px-4 py-2 shadow-md"
        >
          <input
            type="text"
            placeholder="Describe your goal or concern… (e.g., improve sleep)"
            value={inputSearchQuery}
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
              <XIcon className="h-5 w-5" />
            </button>
          )}

          <button
            type="submit"
            className="bg-accent hover:bg-accent/90 ml-4 flex h-10 w-10 items-center justify-center rounded-full text-white transition"
          >
            <SearchIcon className="h-5 w-5" />
          </button>
        </form>
      </Section>

      {/* Warning text */}
      <Section>
        <p className="text-dark/70 mx-auto max-w-lg text-center">
          This feature is for informational purposes only and does not diagnose or treat medical
          conditions. Always consult a healthcare professional before starting any new supplement.
        </p>
      </Section>

      {/* Modal */}
      {isModalOpen && (
        <SmartSearchResultsModal
          query={inputSearchQuery}
          products={productResults}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* Loader */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="border-t-accent h-16 w-16 animate-spin rounded-full border-4 border-gray-200"></div>
        </div>
      )}
    </div>
  );
}
