"use client";

import { useState } from "react";
import Link from "next/link";
import InfiniteFeed from "./infinite-feed";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  imageUrl: string;
  pubName: string | null;
  city: string | null;
  aiScore: number | null;
  createdAt: string;
  userId: string;
  user: { username: string | null; image: string | null };
  nailedCount: number;
  notQuiteCount: number;
  userVote: "nailed" | "notquite" | null;
  totalComments: number;
  isOwner: boolean;
}

interface FeedTabsProps {
  forYouPosts: Post[];
  forYouCursor: string | null;
  followingPosts: Post[];
  followingCursor: string | null;
  isLoggedIn: boolean;
}

export default function FeedTabs({
  forYouPosts,
  forYouCursor,
  followingPosts,
  followingCursor,
  isLoggedIn,
}: FeedTabsProps) {
  const [tab, setTab] = useState<"forYou" | "following">("forYou");

  return (
    <>
      {/* Tab bar */}
      <div className="flex gap-1 mb-5 bg-porter border border-malt rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab("forYou")}
          className={cn(
            "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
            tab === "forYou"
              ? "bg-harp text-stout"
              : "text-foam hover:text-cream"
          )}
        >
          For You
        </button>
        <button
          onClick={() => setTab("following")}
          className={cn(
            "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
            tab === "following"
              ? "bg-harp text-stout"
              : "text-foam hover:text-cream"
          )}
        >
          Following
        </button>
      </div>

      {/* For You feed */}
      {tab === "forYou" && (
        forYouPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-foam gap-4">
            <p className="italic text-lg">No pints yet.</p>
            <Link href="/upload" className="bg-harp text-stout font-bold px-6 py-3 rounded-xl text-sm tracking-wide hover:opacity-90 transition-opacity">
              Post the first pint
            </Link>
          </div>
        ) : (
          <InfiniteFeed initialPosts={forYouPosts} initialCursor={forYouCursor} feedType="forYou" />
        )
      )}

      {/* Following feed */}
      {tab === "following" && (
        !isLoggedIn ? (
          <div className="flex flex-col items-center justify-center h-64 text-foam gap-3">
            <p className="text-cream font-semibold">Sign in to see your feed</p>
            <Link href="/auth/login" className="bg-harp text-stout font-bold px-6 py-3 rounded-xl text-sm tracking-wide hover:opacity-90 transition-opacity">
              Sign in
            </Link>
          </div>
        ) : followingPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-foam gap-3 text-center px-6">
            <p className="text-cream font-semibold">No pints from people you follow yet</p>
            <p className="text-sm text-foam/70">Find someone to follow by searching for a pub or username</p>
            <Link href="/search" className="bg-harp text-stout font-bold px-6 py-3 rounded-xl text-sm tracking-wide hover:opacity-90 transition-opacity">
              Find people
            </Link>
          </div>
        ) : (
          <InfiniteFeed initialPosts={followingPosts} initialCursor={followingCursor} feedType="following" />
        )
      )}
    </>
  );
}
