"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X } from "lucide-react";

const SEEN_KEY = "splitg_onboarded";

function SplitGMark({ size = 64 }: { size?: number }) {
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

export default function OnboardingModal() {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const seen = localStorage.getItem(SEEN_KEY);
    if (!seen) {
      // Small delay so the feed renders first — feels less jarring
      const t = setTimeout(() => setShow(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(SEEN_KEY, "1");
    setShow(false);
  }

  if (!mounted || !show) return null;

  const modal = (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
      {/* Non-clickable backdrop — user must use the button or X to dismiss */}
      <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" />

      {/* Sheet */}
      <div className="relative z-10 w-full sm:max-w-sm bg-porter border border-malt rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">

        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-foam hover:text-cream transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center gap-5 px-7 pt-10 pb-4 text-center">
          <SplitGMark size={64} />

          <div className="flex flex-col gap-2">
            <h2 className="font-display text-2xl font-bold text-cream leading-tight">
              What&apos;s Splitting the G?
            </h2>
            <p className="text-foam text-sm leading-relaxed">
              Get a fresh Guinness. Take <span className="text-cream font-semibold">one sip</span> — just one — and set the glass down.
            </p>
            <p className="text-foam text-sm leading-relaxed">
              The goal: land the foam line <span className="text-harp font-semibold">inside the gap of the G</span> on the glass. That gap is tiny. The margin for error is basically zero.
            </p>
            <p className="text-foam text-sm leading-relaxed">
              Nail it? Post the proof. Let the community judge.
            </p>
          </div>
        </div>

        {/* Steps — visual quick-ref */}
        <div className="flex justify-center gap-0 px-6 py-4">
          {["Pour", "One sip", "Land in G", "Post it"].map((label, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="w-7 h-7 rounded-full bg-malt flex items-center justify-center text-xs font-bold text-harp">
                {i + 1}
              </span>
              <span className="text-[10px] text-foam/70 font-medium text-center">{label}</span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2 px-6 pb-8 pt-2">
          <button
            onClick={dismiss}
            className="w-full bg-harp text-stout font-bold py-3 rounded-xl text-sm tracking-wide hover:opacity-90 transition-opacity"
          >
            Got it, let&apos;s go
          </button>
          <Link
            href="/about"
            onClick={dismiss}
            className="text-center text-xs text-foam/60 hover:text-foam transition-colors py-1"
          >
            Learn more about the challenge →
          </Link>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
