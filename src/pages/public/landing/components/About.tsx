import { landingHighlights } from "@/dataHelper/landing.dataHelper";

export default function About() {
  return (
    <section className="bg-brand-dark/[0.02] py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-title text-3xl font-black uppercase tracking-tight text-brand-text-dark">Vì sao chọn Đà Nẵng?</h2>
          <div className="mx-auto h-1 w-20 bg-primary"></div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {landingHighlights.map((item, idx) => (
            <div key={idx} className="rounded-2xl border border-brand-dark/5 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="mb-6 inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon size={24} />
              </div>
              <h3 className="mb-3 text-lg font-bold text-brand-text-dark">{item.title}</h3>
              <p className="font-sans leading-relaxed text-brand-text-dark/60">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
