import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';

// Same frame as BestDealGroupCard: badge, name, brand, price, offers button
export default function BestDealGroupCardSkeleton() {
  return (
    <Card className="flex w-44 flex-col items-center gap-2 p-4 sm:w-48">
      <Skeleton className="h-5 w-12 rounded-full" />
      <div className="flex min-h-14 w-full flex-col items-center justify-center gap-1.5">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="mb-1 h-6 w-20" />
      <Skeleton className="h-8 w-full" />
    </Card>
  );
}
