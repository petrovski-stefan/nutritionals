import Skeleton from '@/components/ui/Skeleton';

// Same frame as a collapsed DropdownProductGroup row
export default function DropdownProductGroupSkeleton() {
  return (
    <div className="border-border flex items-center justify-between gap-3 border-b px-3 py-2.5 last:border-0">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  );
}
