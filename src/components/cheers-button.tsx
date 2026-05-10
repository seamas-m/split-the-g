"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

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

    // Optimistic update
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
      // Revert on failure
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
      <span
        className={cn(
          "text-base leading-none transition-transform",
          animating && "animate-cheers"
        )}
      >
        🍻
      </span>
      <span className="text-xs">{count > 0 ? count : ""}</span>
    </button>
  );
}
