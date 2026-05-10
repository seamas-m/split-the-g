function SplitGMark({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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

export default function AuthHowItWorks() {
  return (
    <div className="flex flex-col gap-6">
      {/* Brand */}
      <div className="flex flex-col gap-3">
        <SplitGMark size={48} />
        <div>
          <h1 className="font-display text-3xl font-bold text-cream leading-tight">Split the G</h1>
          <p className="text-foam text-sm mt-1">The precision drinking challenge.</p>
        </div>
      </div>

      {/* The concept */}
      <p className="text-foam text-sm leading-relaxed">
        Get a freshly poured Guinness. Take <span className="text-cream font-semibold">one sip</span> — just one — and set the glass down. The goal: land the foam line <span className="text-harp font-semibold">exactly inside the gap of the G</span> on the glass.
      </p>
      <p className="text-foam text-sm leading-relaxed">
        That gap is tiny. The margin for error is basically zero. Nail it? Post the proof.
      </p>

      {/* Steps */}
      <div className="flex flex-col gap-2">
        {[
          { n: "01", label: "Get a freshly poured Guinness in a branded glass" },
          { n: "02", label: "Find the G — that gap is your target" },
          { n: "03", label: "Take one clean sip. Not two. One." },
          { n: "04", label: "Land the foam line inside the G. Post the proof." },
        ].map(({ n, label }) => (
          <div key={n} className="flex items-start gap-3">
            <span className="text-harp font-display font-bold text-sm shrink-0 pt-px">{n}</span>
            <p className="text-foam/80 text-sm leading-snug">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
