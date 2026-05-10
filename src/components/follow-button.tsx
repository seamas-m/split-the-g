"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  followingId: string;
  initialFollowing: boolean;
  followerCount: number;
}

export default function FollowButton({ followingId, initialFollowing, followerCount }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(followerCount);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (loading) return;
    setLoading(true);
    const prev = following;
    // Optimistic
    setFollowing(!prev);
    setCount((c) => c + (prev ? -1 : 1));

    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followingId }),
      });
      if (!res.ok) {
        // Revert
        setFollowing(prev);
        setCount((c) => c + (prev ? 1 : -1));
      }
    } catch {
      setFollowing(prev);
      setCount((c) => c + (prev ? 1 : -1));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={toggle}
        disabled={loading}
        className={cn(
          "px-5 py-1.5 rounded-xl text-sm font-semibold border transition-all",
          following
            ? "border-malt text-foam hover:border-foam hover:text-cream"
            : "bg-harp text-stout border-harp hover:opacity-90"
        )}
      >
        {following ? "Following" : "Follow"}
      </button>
      {count > 0 && (
        <span className="text-[11px] text-foam/50">{count} follower{count !== 1 ? "s" : ""}</span>
      )}
    </div>
  );
}
