import Link from "next/link";
import Navbar from "@/components/navbar";
import AppHeader from "@/components/app-header";

export default function AboutPage() {
  return (
    <>
      <AppHeader />
      <main className="flex-1 pb-24 w-full max-w-lg mx-auto px-6 py-8 flex flex-col gap-10">

        {/* Hero */}
        <div className="flex flex-col items-center gap-4 text-center pt-4">
          <div className="text-6xl leading-none select-none">🍺</div>
          <h1 className="font-display text-4xl font-bold text-cream leading-tight">
            What is<br />Splitting the G?
          </h1>
          <p className="text-foam text-sm leading-relaxed max-w-xs">
            Every Guinness poured has a line. The question is — where does that line fall?
          </p>
        </div>

        {/* The rule */}
        <section className="bg-porter border border-malt rounded-2xl p-6 flex flex-col gap-3">
          <h2 className="font-display text-2xl font-bold text-harp">The Rule</h2>
          <p className="text-cream/90 text-sm leading-relaxed">
            A perfectly poured Guinness should have the split — where the dark stout meets the creamy head — land right in the middle of the golden harp on the glass.
          </p>
          <p className="text-cream/90 text-sm leading-relaxed">
            That&apos;s the <span className="text-harp font-semibold">G</span>. And if the head sits exactly at the G, you&apos;ve got yourself a <span className="text-harp font-semibold">split</span>.
          </p>
        </section>

        {/* Why it matters */}
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-2xl font-bold text-cream">Why does it matter?</h2>
          <p className="text-foam text-sm leading-relaxed">
            It doesn&apos;t. And that&apos;s the point.
          </p>
          <p className="text-foam text-sm leading-relaxed">
            Splitting the G is the kind of thing that only people who care too much about a perfect pint care about. It&apos;s a mark of a bartender who takes their time. A two-part pour, a proper settle, a steady hand. No rushing. No sloppiness.
          </p>
          <p className="text-foam text-sm leading-relaxed">
            It&apos;s also a great excuse to order another one and study it closely.
          </p>
        </section>

        {/* How to spot one */}
        <section className="bg-porter border border-malt rounded-2xl p-6 flex flex-col gap-4">
          <h2 className="font-display text-2xl font-bold text-harp">How to spot a Split</h2>
          <ol className="flex flex-col gap-3">
            {[
              { n: "01", text: "Order a Guinness. Obviously." },
              { n: "02", text: "Wait for the two-part pour. If they rush it, red flag." },
              { n: "03", text: "When it arrives, check the glass. Find the harp." },
              { n: "04", text: "Does the creamy head meet the dark body right at the G? That's a split." },
              { n: "05", text: "Take a photo. Post it here. Cheers it. Repeat." },
            ].map(({ n, text }) => (
              <li key={n} className="flex gap-4 items-start">
                <span className="text-harp font-display font-bold text-lg shrink-0 leading-tight">{n}</span>
                <p className="text-cream/90 text-sm leading-relaxed">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Pro tips */}
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-2xl font-bold text-cream">Pro tips</h2>
          <div className="flex flex-col gap-2">
            {[
              "The 119.5-second pour is gospel. Any barman worth their salt knows this.",
              "A good head is 10–15mm. Dome-shaped, dense, never flat.",
              "It should be served at 6°C. Cold, not freezing.",
              "If it comes in under 90 seconds, send it back.",
              "The glass should be a Guinness branded tulip. Anything else is a tourist trap.",
            ].map((tip, i) => (
              <div key={i} className="flex gap-3 items-start py-2 border-b border-malt/50 last:border-0">
                <span className="text-harp text-xs mt-0.5">—</span>
                <p className="text-foam text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <p className="text-foam text-sm">Ready to find a split near you?</p>
          <Link
            href="/upload"
            className="bg-harp text-stout font-bold px-8 py-3 rounded-xl text-sm tracking-wide hover:opacity-90 transition-opacity"
          >
            Post your pint
          </Link>
          <Link href="/feed" className="text-foam text-xs hover:text-cream transition-colors">
            Or browse the feed →
          </Link>
        </div>

      </main>
      <Navbar />
    </>
  );
}
