import Card from '@/components/ui/Card';
import { formatDate } from '@/shared/utils/dates';

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
  const lastScrapedAt = last_scraped_at ? formatDate(last_scraped_at) : '/';

  return (
    <Card
      hover
      className="flex size-44 flex-col items-center justify-center gap-3 p-4 sm:size-48"
    >
      <p className="line-clamp-2 text-center text-lg font-semibold">
        <a
          href={homepage}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary focus-visible:outline-primary rounded transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
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
