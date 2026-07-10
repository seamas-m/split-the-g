import Link from "next/link";
import Navbar from "@/components/navbar";
import AppHeader from "@/components/app-header";

function SplitGMark({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 38,20.5833 L 47.5,20.5833
           C 49.0833,23.75 49.0833,28.5 49.0833,30.0833
           C 49.0833,42.75 45.9167,42.75 45.5208,49.0833
           L 45.9167,57
           C 45.9167,58.5833 44.3333,58.5833 44.3333,58.5833
           L 31.6667,58.5833
           C 31.6667,58.5833 30.0833,58.5833 30.0833,57
           L 30.4792,49.0833
           C 30.0833,42.75 26.9167,42.75 26.9167,30.0833
           C 26.9167,28.5 26.9167,23.75 28.5,20.5833
           L 38,20.5833 Z"
        stroke="#c9a454" strokeWidth="2" strokeLinejoin="round"
      />
      <path
        d="M 43.5416,56.2083 L 44.3333,55.4167 L 31.6667,55.4167 L 32.4583,56.2083 L 43.5416,56.2083 Z"
        stroke="#c9a454" strokeWidth="1.5" strokeLinejoin="round"
      />
      <line x1="26" y1="30.5" x2="50" y2="30.5" stroke="#c9a454" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function AboutPage() {
  return (
    <>
      <AppHeader />
      <main className="flex-1 pb-24 w-full max-w-lg mx-auto px-6 py-8 flex flex-col gap-10">

        {/* Hero */}
        <div className="flex flex-col items-center gap-4 text-center pt-4">
          <SplitGMark size={80} />
          <h1 className="font-display text-4xl font-bold text-cream leading-tight">
            What is<br />Splitting the G?
          </h1>
          <p className="text-foam text-sm leading-relaxed max-w-xs">
            One pint. One sip. One very small target.
          </p>
        </div>

        {/* The challenge */}
        <section className="bg-porter border border-malt rounded-2xl p-6 flex flex-col gap-3">
          <h2 className="font-display text-2xl font-bold text-harp">The Challenge</h2>
          <p className="text-cream/90 text-sm leading-relaxed">
            Take a freshly poured Guinness. Now take a single sip — just one — and set the glass back down.
          </p>
          <p className="text-cream/90 text-sm leading-relaxed">
            The goal: land the line where the dark stout meets the creamy white head <span className="text-harp font-semibold">exactly inside the gap of the letter G</span> on the Guinness pint glass.
          </p>
          <p className="text-cream/90 text-sm leading-relaxed">
            That gap is tiny. The margin for error is basically zero. That&apos;s the whole point.
          </p>
        </section>

        {/* How to do it */}
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-2xl font-bold text-cream">How to play</h2>
          <ol className="flex flex-col gap-4">
            {[
              { n: "01", title: "Start fresh", text: "Get a properly poured Guinness in a branded pint glass. Let it settle — you know the deal." },
              { n: "02", title: "Find the G", text: "Locate the letter G in the Guinness logo on the glass. That gap in the G is your target. Study it." },
              { n: "03", title: "Estimate", text: "Gauge how much liquid sits above the G. That's exactly how much you need to drink. Not a drop more, not a drop less." },
              { n: "04", title: "One sip", text: "Take one clean sip. No gulping, no cheating. One smooth pull." },
              { n: "05", title: "Check", text: "Set the glass down on a flat surface and check the line. Did the foam meet the stout right inside the G? You split it." },
            ].map(({ n, title, text }) => (
              <li key={n} className="flex gap-4 items-start">
                <span className="text-harp font-display font-bold text-lg shrink-0 leading-tight pt-0.5">{n}</span>
                <div className="flex flex-col gap-1">
                  <span className="text-cream font-semibold text-sm">{title}</span>
                  <p className="text-foam text-sm leading-relaxed">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Why it's hard */}
        <section className="bg-porter border border-malt rounded-2xl p-6 flex flex-col gap-3">
          <h2 className="font-display text-2xl font-bold text-harp">Why it&apos;s harder than it looks</h2>
          <p className="text-cream/90 text-sm leading-relaxed">
            The gap in the G is narrow. The foam compresses as you drink. The angle of the glass matters. Your sip size varies every time.
          </p>
          <p className="text-cream/90 text-sm leading-relaxed">
            A clean split is genuinely rare — which is exactly why it&apos;s worth documenting when it happens.
          </p>
        </section>

        {/* Tips */}
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-2xl font-bold text-cream">Tips from the regulars</h2>
          <div className="flex flex-col gap-0">
            {[
              "Study the glass before you drink — know where the G sits relative to the liquid level.",
              "Count your gulps. Find a consistent sip size and repeat it every time.",
              "Some swear by closing their eyes to concentrate. Others think that&apos;s mad.",
              "Keep the glass upright when you set it down. Tilting changes everything.",
              "It started in Irish pubs, went viral, and now it&apos;s a thing everywhere Guinness is poured properly.",
            ].map((tip, i) => (
              <div key={i} className="flex gap-3 items-start py-3 border-b border-malt/50 last:border-0">
                <span className="text-harp text-xs mt-1 shrink-0">—</span>
                <p className="text-foam text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <p className="text-foam text-sm">Nailed a split? We need proof.</p>
          <Link
            href="/upload"
            className="bg-harp text-cream font-bold px-8 py-3 rounded-xl text-sm tracking-wide hover:opacity-90 transition-opacity"
          >
            Post your split
          </Link>
          <Link href="/feed" className="text-foam text-xs hover:text-cream transition-colors">
            See how others are doing →
          </Link>
        </div>

      </main>
      <Navbar />
    </>
  );
}
