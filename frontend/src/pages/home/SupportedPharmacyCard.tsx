type Props = {
  idx: number;
  name: string;
  homepage: string;
  num_products: number;
  last_scraped_at: string | null;
};

export default function SupportedPharmacyCard({
  idx,
  name,
  homepage,
  num_products,
  last_scraped_at,
}: Props) {
  const lastScrapedAt = last_scraped_at
    ? new Date(last_scraped_at).toLocaleDateString('en-GB')
    : '/';

  const cardBackgroundColor = idx % 2 === 0 ? 'bg-white' : 'bg-green-50';

  return (
    <div
      className={`flex h-[200px] w-[200px] flex-col items-center justify-center gap-3 rounded-3xl border border-gray-200 ${cardBackgroundColor} p-4 shadow-md transition-transform hover:scale-105 hover:shadow-xl`}
    >
      <p className="line-clamp-2 text-center text-2xl font-semibold text-black">
        <a
          href={homepage}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-accent transition-colors hover:underline"
        >
          {name}
        </a>
      </p>

      <p className="text-center text-lg text-gray-700">
        <span className="text-primary font-bold">{num_products}</span> суплементи
      </p>

      <p className="text-center text-xs text-gray-400">Ажурирано на: {lastScrapedAt}</p>
    </div>
  );
}
