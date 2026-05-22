/**
 * Loading UI for Next.js App Router
 * Displayed while page data is being fetched (SSG/ISR)
 */

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 h-24 bg-transparent" />

      <main className="flex flex-1 flex-col">
        {/* Hero skeleton */}
        <section className="relative min-h-screen flex items-center justify-center pt-28 pb-10">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-6 animate-pulse">
                <div className="h-6 w-24 bg-primary/20 rounded-full" />
                <div className="h-16 w-3/4 bg-primary/10 rounded-lg" />
                <div className="h-8 w-1/2 bg-primary/10 rounded-lg" />
                <div className="h-20 w-full bg-primary/10 rounded-lg" />
                <div className="flex gap-4">
                  <div className="h-12 w-36 bg-primary/20 rounded-lg" />
                  <div className="h-12 w-36 bg-primary/10 rounded-lg" />
                </div>
              </div>
              <div className="flex justify-center lg:justify-end animate-pulse">
                <div className="w-72 h-96 bg-primary/10 rounded-3xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Journey skeleton */}
        <section className="py-20">
          <div className="container mx-auto px-6 animate-pulse">
            <div className="h-10 w-48 bg-primary/10 rounded-lg mx-auto mb-4" />
            <div className="h-5 w-32 bg-primary/10 rounded-lg mx-auto mb-12" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 bg-primary/5 rounded-2xl border border-primary/10" />
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack skeleton */}
        <section className="py-20">
          <div className="container mx-auto px-6 animate-pulse">
            <div className="h-10 w-36 bg-primary/10 rounded-lg mx-auto mb-4" />
            <div className="h-5 w-48 bg-primary/10 rounded-lg mx-auto mb-12" />
            <div className="flex gap-8 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 w-40 bg-primary/5 rounded-xl border border-primary/10 flex-shrink-0" />
              ))}
            </div>
          </div>
        </section>

        {/* Projects skeleton */}
        <section className="py-20">
          <div className="container mx-auto px-6 animate-pulse">
            <div className="h-10 w-44 bg-primary/10 rounded-lg mx-auto mb-4" />
            <div className="h-5 w-24 bg-primary/10 rounded-lg mx-auto mb-12" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-96 bg-primary/5 rounded-2xl border border-primary/10" />
              ))}
            </div>
          </div>
        </section>

        {/* Achievements skeleton */}
        <section className="py-20">
          <div className="container mx-auto px-6 animate-pulse">
            <div className="h-10 w-56 bg-primary/10 rounded-lg mx-auto mb-4" />
            <div className="h-5 w-40 bg-primary/10 rounded-lg mx-auto mb-12" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-primary/5 rounded-2xl border border-primary/10" />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
