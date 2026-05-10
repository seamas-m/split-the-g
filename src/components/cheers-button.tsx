"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// Pint glass SVG — outline only when uncheersed, gold fill when cheersed
function PintGlassIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 76 76"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Glass body */}
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
        fill={filled ? "#c9a454" : "none"}
        stroke="#c9a454"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Base cap */}
      <path
        d="M 43.5416,56.2083 L 44.3333,55.4167 L 31.6667,55.4167 L 32.4583,56.2083 L 43.5416,56.2083 Z"
        fill={filled ? "#c9a454" : "none"}
        stroke="#c9a454"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Split line */}
      <line
        x1="26" y1="30.5" x2="50" y2="30.5"
        stroke={filled ? "#1c1714" : "#c9a454"}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface CheersButtonProps {
  postId: string;
  totalCheers: number;
  hasCheersed: boolean;
}

export default function CheersButton({ postId, totalCheers, hasCheersed }: CheersButtonProps) {
  const [cheersed, setCheersed] = useState(hasCheersed);
  const [count, setCount] = useState(totalCheers);
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCheers() {
    if (loading) return;
    setLoading(true);

    const wasChecked = cheersed;
    setCheersed(!wasChecked);
    setCount((c) => (wasChecked ? c - 1 : c + 1));
    if (!wasChecked) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 400);
    }

    try {
      await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
    } catch {
      setCheersed(wasChecked);
      setCount((c) => (wasChecked ? c + 1 : c - 1));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCheers}
      className={cn(
        "flex items-center gap-1.5 transition-colors",
        cheersed ? "text-harp" : "text-foam hover:text-cream"
      )}
    >
      <PintGlassIcon
        filled={cheersed}
        className={animating ? "animate-cheers" : ""}
      />
      <span className="text-xs">{count > 0 ? count : ""}</span>
    </button>
  );
}
