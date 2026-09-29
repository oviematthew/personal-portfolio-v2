export default function ProjectPageLoading() {
  return (
    <div className="mx-auto max-w-[1400px] animate-pulse px-6 py-12">
      <div className="mb-10 h-5 w-24 rounded bg-white/10" />
      <div className="h-32 w-3/4 rounded-2xl bg-white/10 md:h-48" />
      <div className="mt-14 aspect-[16/8] w-full rounded-3xl bg-white/10" />
      <div className="mt-20 grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="h-40 rounded-xl bg-white/10 lg:col-span-4" />
        <div className="h-64 rounded-xl bg-white/10 lg:col-span-8" />
      </div>
    </div>
  );
}
