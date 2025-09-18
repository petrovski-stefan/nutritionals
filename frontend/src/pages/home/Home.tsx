import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HomePageProduct from './BestDealProduct';
import Section from './Section';
import PharmacyCard from './SupportedPharmacyCard';
import { simulatedBestDealsData, supportedPharmacies } from './constants';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

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

  const productsElements = simulatedBestDealsData.map((product) => (
    <HomePageProduct
      key={product.id}
      {...product}
    />
  ));

  const supportedPharmaciesElements = supportedPharmacies.map((pharmacy) => (
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
          className="mx-auto flex max-w-2xl justify-around rounded-2xl bg-white px-6 py-2"
          onSubmit={(e) => handleFormSubmit(e)}
        >
          <input
            className="w-[70%] rounded-2xl p-4 outline-none"
            type="text"
            name="query"
            placeholder="Ex. vitamin c ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => handleKeyDownEnter(e)}
          />
          <button
            className="border-accent bg-accent w-[20%] cursor-pointer rounded-3xl border-2 p-3 font-bold text-white"
            type="submit"
          >
            Search
          </button>
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
        <div className="mt-[5vh] flex justify-around">{productsElements}</div>
      </Section>

      <Section>
        <p className="flex justify-center p-4 text-2xl font-bold">Supported pharmacies currently</p>
        <div className="mt-[5vh] flex justify-around">{supportedPharmaciesElements}</div>
      </Section>
    </div>
  );
}
