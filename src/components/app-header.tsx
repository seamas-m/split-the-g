"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { useSession } from "@/lib/auth-client";

function SplitGMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* G letterform */}
      <path
        d="M25 8.2C22.5 5.8 19.4 4.5 16 4.5C9.1 4.5 3.5 10.1 3.5 16C3.5 21.9 9.1 27.5 16 27.5C22.3 27.5 27.5 22.8 27.5 17V15H16V18.5H23.5C22.2 21.6 19.3 23.5 16 23.5C11.2 23.5 7.5 20.1 7.5 16C7.5 11.9 11.2 8.5 16 8.5C18.3 8.5 20.4 9.4 22 10.9L25 8.2Z"
        fill="#c9a454"
      />
      {/* Horizontal split line */}
      <line x1="3" y1="16" x2="27" y2="16" stroke="#0e0c0b" strokeWidth="2" strokeLinecap="round" />
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
