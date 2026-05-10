"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Vote = "nailed" | "notquite" | null;

interface SplitVoteProps {
  postId: string;
  nailedCount: number;
  notQuiteCount: number;
  userVote: Vote;
}

export default function SplitVote({ postId, nailedCount, notQuiteCount, userVote }: SplitVoteProps) {
  const [vote, setVote] = useState<Vote>(userVote);
  const [nailed, setNailed] = useState(nailedCount);
  const [notQuite, setNotQuite] = useState(notQuiteCount);
  const [loading, setLoading] = useState(false);

  async function handleVote(picked: "nailed" | "notquite") {
    if (loading) return;
    setLoading(true);

    // Optimistic update
    const prev = vote;
    if (prev === picked) {
      // Toggle off
      setVote(null);
      picked === "nailed" ? setNailed((n) => n - 1) : setNotQuite((n) => n - 1);
    } else {
      // Switch or new vote
      setVote(picked);
      if (picked === "nailed") {
        setNailed((n) => n + 1);
        if (prev === "notquite") setNotQuite((n) => n - 1);
      } else {
        setNotQuite((n) => n + 1);
        if (prev === "nailed") setNailed((n) => n - 1);
      }
    }

    try {
      await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, vote: picked }),
      });
    } catch {
      // Revert on error
      setVote(prev);
      setNailed(nailedCount);
      setNotQuite(notQuiteCount);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleVote("nailed")}
        className={cn(
          "flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-all",
          vote === "nailed"
            ? "bg-harp/20 border-harp text-harp font-semibold"
            : "border-malt text-foam hover:border-foam hover:text-cream"
        )}
      >
        Nailed it {nailed > 0 && <span className="opacity-70">{nailed}</span>}
      </button>

      <button
        onClick={() => handleVote("notquite")}
        className={cn(
          "flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-all",
          vote === "notquite"
            ? "bg-foam/10 border-foam text-cream font-semibold"
            : "border-malt text-foam hover:border-foam hover:text-cream"
        )}
      >
        Not quite {notQuite > 0 && <span className="opacity-70">{notQuite}</span>}
      </button>
    </div>
  );
}
