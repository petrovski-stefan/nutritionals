import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';

const OFFER_ROWS = 3;

// Same frame as ProductGroupCard: title, brand, offer count, then offer rows
export default function ProductGroupCardSkeleton() {
  return (
    <Card className="flex w-full flex-col p-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="mt-2 h-4 w-1/3" />
      <Skeleton className="mt-1 h-4 w-1/4" />

      <div className="divide-border mt-3 divide-y">
        {Array.from({ length: OFFER_ROWS }, (_, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-3 py-3"
          >
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    </Card>
  );
}
