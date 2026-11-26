import Skeleton from '@/components/ui/Skeleton';

const CHIP_WIDTHS = ['w-14', 'w-24', 'w-20', 'w-28', 'w-16'];

export default function CategoryChipsSkeleton() {
  return (
    <div className="mb-6 flex gap-2 overflow-x-auto py-1 max-sm:-mx-4 max-sm:px-4 sm:flex-wrap sm:justify-center sm:overflow-visible">
      {CHIP_WIDTHS.map((width) => (
        <Skeleton
          key={width}
          className={`h-8 shrink-0 rounded-full ${width}`}
        />
      ))}
    </div>
  );
}
