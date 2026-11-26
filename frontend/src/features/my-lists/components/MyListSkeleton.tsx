import Skeleton from '@/components/ui/Skeleton';

const ACTIONS = 3;

export default function MyListSkeleton() {
  return (
    <li className="border-border flex items-center justify-between gap-2 border-b px-4 py-4 last:border-0 md:gap-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {Array.from({ length: ACTIONS }, (_, index) => (
          <Skeleton
            key={index}
            className="h-7 w-7 rounded-full"
          />
        ))}
      </div>
    </li>
  );
}
