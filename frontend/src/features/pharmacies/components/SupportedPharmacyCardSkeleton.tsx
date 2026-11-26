import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';

// Same frame as SupportedPharmacyCard: name, product count, last update
export default function SupportedPharmacyCardSkeleton() {
  return (
    <Card className="flex size-44 flex-col items-center justify-center gap-3 p-4 sm:size-48">
      <Skeleton className="h-7 w-28" />
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-3 w-24" />
    </Card>
  );
}
