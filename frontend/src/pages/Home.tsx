import { XIcon } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import Section from '../components/layout/Section';
import Tooltip from '../components/ui/Tooltip';
import SupportedPharmacyCard from '../features/pharmacies/components/SupportedPharmacyCard';
import usePharmacies from '../features/pharmacies/hooks/usePharmacies';
import BestDealsProductCard from '../features/products/components/BestDealProductCard';
import DropdownProductCard from '../features/products/components/DropdownProduct';
import useProductsOnDiscount from '../features/products/hooks/useProductsOnDiscount';
import useProductsSearch from '../features/products/hooks/useProductsSearch';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: pharmacies,
    isError: pharmaciesIsError,
    isPending: pharmaciesIsPending,
    isSuccess: pharmaciesIsSuccess,
  } = usePharmacies();

  const {
    data: productsOnDiscount,
    isError: productsOnDiscountIsError,
    isPending: productsOnDiscountIsPending,
    isSuccess: productsOnDiscountIsSuccess,
  } = useProductsOnDiscount();

  const shouldSearch = searchQuery.length > 2;

  const {
    data: searchedProducts,
    isSuccess: productsSearchIsSuccess,
    isPending: productsSearchIsPending,
    isError: productsSearchIsError,
  } = useProductsSearch(searchQuery, shouldSearch);

  return (
    <div className="bg-neutral min-h-screen">
      <Section center={true}>
        <h1 className="text-dark text-center text-3xl font-bold">
          Пронајдете ги најдобрите цени на суплементи од локалните аптеки.
        </h1>
        <p className="text-dark/70 mt-5 text-center text-lg">
          Споредете ги понудите веднаш и заштедете на она што ви е потребно.
        </p>
      </Section>

      <Section center={true}>
        <div className="relative mx-auto flex w-full max-w-3xl items-center rounded-3xl bg-white px-4 py-2 shadow-md">
          <input
            className="focus:ring-accent focus:border-accent flex-1 rounded-2xl bg-white px-4 py-3 transition outline-none focus:ring-2"
            type="text"
            placeholder={'Пример. Магнезиум глицинат'}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
              }}
              className="text-dark/50 hover:text-dark absolute top-1/2 right-5 -translate-y-1/2 cursor-pointer"
            >
              <Tooltip text="Исчисти пребарување">
                <XIcon className="h-6 w-6" />
              </Tooltip>
            </button>
          )}

          {shouldSearch && (
            <div className="bg-neutral absolute top-20 left-0 z-50 max-h-96 w-full max-w-3xl overflow-y-auto rounded-2xl p-2 shadow-lg">
              {productsSearchIsSuccess &&
                searchedProducts.length > 0 &&
                searchedProducts.map((p) => (
                  <DropdownProductCard
                    key={p.id}
                    {...p}
                  />
                ))}

              {productsSearchIsSuccess && searchedProducts.length === 0 && (
                <p className="text-dark/50 py-4 text-center">
                  Не беа пронајдени суплементи со вашето пребарување. Обидете се повторно.
                </p>
              )}

              {productsSearchIsPending && (
                <p className="text-dark/50 py-4 text-center">Се вчитува ...</p>
              )}

              {productsSearchIsError && (
                <p className="text-dark/50 py-4 text-center">
                  Се случи неочекувана грешка. Обидете се повторно.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-3 text-center">
          <Link
            to="/smart-search"
            className="hover:decoration-accent text-dark/70 text-sm italic hover:underline"
          >
            Не најдовте тоа што ви треба? Обидете се со паметното пребарување!
          </Link>
        </div>
      </Section>

      {/* PRODUCTS ON DISCOUNT */}
      <Section center={false}>
        <h1 className="flex justify-center p-4 text-center text-2xl font-bold">
          Суплементи со најголемо намалување
        </h1>

        {productsOnDiscountIsSuccess && productsOnDiscount.length > 0 && (
          <div className="mt-5 flex flex-wrap justify-center gap-5">
            {productsOnDiscount.map((product) => (
              <BestDealsProductCard
                key={product.id}
                {...product}
              />
            ))}
          </div>
        )}

        {productsOnDiscountIsSuccess && productsOnDiscount.length === 0 && (
          <p className="text-dark/70 mt-5 text-center text-sm">
            Денес нема суплементи на попуст. Проверете утре повторно.
          </p>
        )}

        {productsOnDiscountIsPending && (
          <p className="text-dark/70 mt-5 text-center text-sm">Се вчитува ...</p>
        )}

        {productsOnDiscountIsError && (
          <p className="text-dark/70 mt-5 text-center text-sm">Се случи неочекувана грешка.</p>
        )}
      </Section>

      {/* SUPPORTED PHARMACIES */}
      <Section center={false}>
        <h1 className="flex justify-center p-4 text-2xl font-bold">Поддржани аптеки од системот</h1>

        {pharmaciesIsSuccess && (
          <div className="mt-5 flex flex-wrap justify-center gap-5">
            {pharmacies.map((pharmacy, i) => (
              <SupportedPharmacyCard
                key={pharmacy.id}
                idx={i}
                {...pharmacy}
              />
            ))}
          </div>
        )}

        {pharmaciesIsPending && (
          <p className="text-dark/70 mt-5 text-center text-sm">Се вчитува ...</p>
        )}

        {pharmaciesIsError && (
          <p className="text-dark/70 mt-5 text-center text-sm">Се случи неочекувана грешка.</p>
        )}
      </Section>
    </div>
  );
}
