"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const PINT = "🍺";

interface PintRatingProps {
  postId: string;
  avgScore: number;
  userScore?: number;
  totalRatings: number;
}

export default function PintRating({ postId, avgScore, userScore, totalRatings }: PintRatingProps) {
  const [hovered, setHovered] = useState(0);
  const [submitted, setSubmitted] = useState(userScore ?? 0);
  const [loading, setLoading] = useState(false);

  const display = hovered || submitted;

  async function rate(score: number) {
    if (loading) return;
    setLoading(true);
    try {
      await fetch(`/api/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, score }),
      });
      setSubmitted(score);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => rate(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            className={cn(
              "text-xl transition-opacity",
              n <= display ? "opacity-100" : "opacity-25"
            )}
          >
            {PINT}
          </button>
        ))}
      </div>
      <p className="text-xs text-zinc-500">
        {avgScore > 0 ? `${avgScore.toFixed(1)} avg · ` : ""}{totalRatings} rating{totalRatings !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
