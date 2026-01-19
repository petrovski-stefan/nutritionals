import { SearchIcon, XIcon } from 'lucide-react';
import Section from '../../components/Section';
import SmartSearchResultsModal from './SmartSearchResultsModal';
import ProductService from '../../api/product';
import { useState, type FormEvent } from 'react';
import type { BackendProduct } from '../../types/product';
import SMART_SEARCH_TEXT from '../../locale/smart-search';
import Tooltip from '../../components/Tooltip';

type Error = 'unexpectedError' | 'noProductsFoundError';

export default function SmartSearch() {
  const [inputSearchQuery, setInputSearchQuery] = useState('');
  const [productResults, setProductResults] = useState<BackendProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | Error>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearchFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputSearchQuery) return;

    setIsLoading(true);
    setIsModalOpen(true);
    setError(null);
    setProductResults([]);

    try {
      const response = await ProductService.smartSearchProducts(inputSearchQuery);
      if (response.status) {
        setProductResults(response.data);
      }
    } catch (error) {
      setError('unexpectedError');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalOnClose = () => {
    setIsModalOpen(false);
    setInputSearchQuery('');
  };

  return (
    <div className="bg-neutral/50 flex flex-col items-center px-4 py-12">
      {/* Hero */}
      <Section>
        <h1 className="text-dark mx-auto max-w-2xl text-center text-lg sm:text-xl md:text-2xl">
          {SMART_SEARCH_TEXT['hero']['h1']}
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
        </form>
      </Section>

      {/* Warning text */}
      <Section>
        <h1 className="text-dark/70 mx-auto max-w-lg text-center">
          {SMART_SEARCH_TEXT['warning']['h1']}
        </h1>
      </Section>

      {/* Modal */}
      {isModalOpen && (
        <SmartSearchResultsModal
          query={inputSearchQuery}
          products={productResults}
          isLoading={isLoading}
          error={error}
          onClose={handleModalOnClose}
        />
      )}
    </div>
  );
}
