import Agent from '@/components/Agent';

export default function Page() {
  return (
    <div className="grid gap-8">
      <header className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Web Design Lead Gen Agent</h1>
        <p className="mt-4 text-slate-300 max-w-2xl mx-auto">
          Qualify prospects, capture contact details, and auto-generate a tailored value summary.
        </p>
      </header>

      <section className="card p-4 md:p-6">
        <Agent />
      </section>

      <footer className="text-center text-slate-400 text-sm">
        Built for high-converting web design lead capture.
      </footer>
    </div>
  );
}
