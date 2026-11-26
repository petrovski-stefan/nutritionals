import Skeleton from '@/components/ui/Skeleton';

// Varied widths so the row reads as chips of different lengths
const CHIP_WIDTHS = ['w-14', 'w-24', 'w-20', 'w-28', 'w-16'];

export default function CategoryChipsSkeleton() {
  return (
    <div className="mb-6 flex flex-wrap justify-center gap-2">
      {CHIP_WIDTHS.map((width) => (
        <Skeleton
          key={width}
          className={`h-8 rounded-full ${width}`}
        />
      ))}
    </div>
  );
}
