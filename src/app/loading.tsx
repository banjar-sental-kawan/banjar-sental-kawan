export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-5 py-8 space-y-6 fade-up">

      {/* Page title skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-24 bg-amber-100 rounded animate-pulse" />
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
      </div>

      {/* Stat pills skeleton */}
      <div className="flex gap-3 flex-wrap">
        {[80, 110, 90].map((w, i) => (
          <div
            key={i}
            className="glass-card px-4 py-2 h-10 rounded-xl animate-pulse bg-white/50"
            style={{ width: w }}
          />
        ))}
      </div>

      {/* Main card skeleton */}
      <div className="glass-card overflow-hidden">
        {/* Table header */}
        <div className="border-b border-slate-100 px-4 py-3 flex gap-8">
          {[40, 160, 80, 80, 120].map((w, i) => (
            <div key={i} className="h-3 bg-slate-100 rounded animate-pulse" style={{ width: w }} />
          ))}
        </div>
        {/* Table rows */}
        {Array(8).fill(0).map((_, i) => (
          <div
            key={i}
            className="border-b border-slate-50 px-4 py-3.5 flex gap-8 items-center"
            style={{ opacity: 1 - i * 0.09 }}
          >
            <div className="h-3 w-6   bg-slate-100 rounded animate-pulse" />
            <div className="h-3 w-40  bg-slate-200 rounded animate-pulse" />
            <div className="h-3 w-20  bg-slate-100 rounded animate-pulse" />
            <div className="h-5 w-24  bg-green-100 rounded-full animate-pulse" />
            <div className="h-3 w-32  bg-slate-100 rounded animate-pulse" />
          </div>
        ))}
      </div>

    </div>
  )
}