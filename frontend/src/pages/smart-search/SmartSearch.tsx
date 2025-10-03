import { useState, type FormEvent } from 'react';
import Section from '../../components/Section';
import { SearchIcon, XIcon } from 'lucide-react';

export default function SmartSearch() {
  const [inputSearchQuery, setInputSearchQuery] = useState('');

  const handleSearchFormSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-col">
      <Section>
        <h1 className="text-dark mt-[5vh] text-lg">
          Describe your goal or concern, and our AI will find the best supplements for you.
        </h1>
      </Section>

      <Section>
        <form
          onSubmit={handleSearchFormSubmit}
          className="relative mx-auto w-[80vh] rounded-2xl px-6 py-2"
        >
          <input
            className="w-full rounded-2xl bg-neutral-200 p-4"
            type="text"
            placeholder="Describe your goal or concern… (e.g., improve sleep)"
            value={inputSearchQuery}
            onChange={(e) => setInputSearchQuery(e.target.value)}
          />

          <button
            className="border-accent bg-accent absolute top-1/5 right-8 w-[10%] cursor-pointer rounded-3xl border-2 p-2 font-bold text-white"
            type="submit"
          >
            <SearchIcon />
          </button>
          <button
            className="hover:text-primary absolute top-6 right-24 flex cursor-pointer"
            onClick={() => setInputSearchQuery('')}
          >
            <XIcon />
          </button>
        </form>
      </Section>

      <Section>
        <p className="text-dark/70">
          This feature is for informational purposes only and does not diagnose or treat medical
          conditions. Always consult a healthcare professional before starting any new supplement.
        </p>
      </Section>
    </div>
  );
}
