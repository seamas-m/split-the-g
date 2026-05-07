"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { useSession } from "@/lib/auth-client";

function SplitGMark({ size = 28 }: { size?: number }) {
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

export default function AppHeader() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 bg-stout/95 backdrop-blur border-b border-malt px-5 py-3 z-40 flex items-center justify-between">
      <Link href="/feed" className="flex items-center gap-2.5">
        <SplitGMark />
        <span className="font-display text-xl font-bold text-cream tracking-tight leading-none">
          Split the G
        </span>
      </Link>

      {session && (
        <Link
          href="/profile"
          className="flex items-center gap-2 text-foam hover:text-cream transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-malt border border-malt hover:border-harp transition-colors flex items-center justify-center text-xs font-bold text-harp">
            {(session.user.name ?? session.user.email ?? "?")[0].toUpperCase()}
          </div>
        </Link>
      )}
    </header>
  );
}
