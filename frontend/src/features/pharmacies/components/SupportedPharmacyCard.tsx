import Card from '../../../components/ui/Card';

type Props = Readonly<{
  name: string;
  homepage: string;
  num_products: number;
  last_scraped_at: string | null;
}>;

export default function SupportedPharmacyCard({
  name,
  homepage,
  num_products,
  last_scraped_at,
}: Props) {
  const lastScrapedAt = last_scraped_at
    ? new Date(last_scraped_at).toLocaleDateString('en-GB')
    : '/';

  return (
    <Card
      hover
      className="flex size-44 flex-col items-center justify-center gap-3 p-4 sm:size-48"
    >
      <p className="line-clamp-2 text-center text-xl font-semibold sm:text-2xl">
        <a
          href={homepage}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-accent focus-visible:outline-primary rounded transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {name}
        </a>
      </p>

      <p className="text-text text-center text-lg">
        <span className="text-primary font-bold">{num_products}</span> суплементи
      </p>

      <p className="text-text-muted text-center text-xs">Ажурирано на: {lastScrapedAt}</p>
    </Card>
  );
}
