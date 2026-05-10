"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import PostCard from "./post-card";

interface Post {
  id: string;
  imageUrl: string;
  pubName: string | null;
  city: string | null;
  createdAt: string;
  userId: string;
  user: { username: string | null; image: string | null };
  nailedCount: number;
  notQuiteCount: number;
  userVote: "nailed" | "notquite" | null;
  totalComments: number;
  isOwner: boolean;
}

interface InfiniteFeedProps {
  initialPosts: Post[];
  initialCursor: string | null;
  feedType?: "forYou" | "following";
}

export default function InfiniteFeed({ initialPosts, initialCursor, feedType = "forYou" }: InfiniteFeedProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset when feedType changes
  useEffect(() => {
    setPosts(initialPosts);
    setCursor(initialCursor);
  }, [feedType, initialPosts, initialCursor]);

  const fetchMore = useCallback(async () => {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const tabParam = feedType === "following" ? "&tab=following" : "";
      const url = `/api/posts?limit=12${cursor ? `&cursor=${cursor}` : ""}${tabParam}`;
      const res = await fetch(url);
      const data = await res.json();
      setPosts((prev) => [...prev, ...data.posts]);
      setCursor(data.nextCursor);
    } finally {
      setLoading(false);
    }
  }, [cursor, loading, feedType]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchMore();
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchMore]);

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="break-inside-avoid">
            <PostCard post={post} isOwner={post.isOwner} />
          </div>
        ))}
      </div>

      {/* Sentinel — triggers next page load */}
      <div ref={sentinelRef} className="h-1" />

      {loading && (
        <p className="text-center text-foam text-sm py-6">Loading more…</p>
      )}

      {!cursor && posts.length > 0 && (
        <p className="text-center text-foam/40 text-xs py-6">You&apos;ve seen it all</p>
      )}
    </>
  );
}
