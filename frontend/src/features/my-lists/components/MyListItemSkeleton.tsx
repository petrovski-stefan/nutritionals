import Skeleton from '@/components/ui/Skeleton';

// Same frame as a MyListItem row: pharmacy badge, product name and meta, price
export default function MyListItemSkeleton() {
  return (
    <li className="border-border flex flex-col gap-4 border-b px-4 py-4 last:border-0 md:flex-row md:items-center">
      <Skeleton className="h-5 w-20 rounded-full" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-7 w-24" />
    </li>
  );
}
