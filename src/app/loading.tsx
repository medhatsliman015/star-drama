export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-6">
      <div className="h-[440px] animate-pulse rounded-2xl bg-white/5" />
      <div className="mt-8 h-8 w-48 animate-pulse rounded bg-white/10" />
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="aspect-[2/3] animate-pulse rounded-xl bg-white/5" />
        ))}
      </div>
    </div>
  );
}
