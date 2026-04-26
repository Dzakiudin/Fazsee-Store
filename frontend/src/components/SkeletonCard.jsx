export default function SkeletonCard() {
  return (
    <div className="bg-surface-container-low rounded-xl p-6 flex flex-col md:flex-row gap-6 comic-outline animate-pulse">
      <div className="w-full md:w-48 h-48 bg-surface-dim rounded-lg shrink-0" />
      <div className="flex flex-col justify-between flex-1 gap-4">
        <div>
          <div className="h-4 w-24 bg-surface-dim rounded mb-3" />
          <div className="h-7 w-3/4 bg-surface-dim rounded mb-2" />
          <div className="h-4 w-full bg-surface-dim rounded" />
          <div className="h-4 w-2/3 bg-surface-dim rounded mt-1" />
        </div>
        <div className="flex items-center justify-between mt-4">
          <div>
            <div className="h-3 w-12 bg-surface-dim rounded mb-1" />
            <div className="h-8 w-28 bg-surface-dim rounded" />
          </div>
          <div className="h-12 w-28 bg-surface-dim rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square rounded-lg bg-surface-dim mb-4" />
          <div className="h-5 w-3/4 bg-surface-dim rounded mb-2" />
          <div className="h-4 w-1/2 bg-surface-dim rounded" />
        </div>
      ))}
    </div>
  );
}
