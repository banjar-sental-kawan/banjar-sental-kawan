export default function Loading() {
  // We create a dummy array of 6 items to generate multiple skeleton cards
  const skeletonCards = Array(6).fill(0);

  return (
    <main className="max-w-4xl mx-auto mt-10 p-6">
      <div className="mb-8">
        {/* Title & Subtitle Skeleton */}
        <div className="h-10 w-64 bg-white/20 rounded-md animate-pulse mb-4"></div>
        <div className="h-5 w-48 bg-white/10 rounded-md animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skeletonCards.map((_, index) => (
          <div key={index} className="glass-panel p-6 animate-pulse flex flex-col gap-4">
            {/* Avatar/Icon Placeholder */}
            <div className="h-12 w-12 rounded-full bg-white/20"></div>
            
            <div>
              {/* Name Placeholder */}
              <div className="h-6 w-3/4 bg-white/20 rounded mb-2"></div>
              {/* Education/Job Placeholder */}
              <div className="h-4 w-1/2 bg-white/10 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}