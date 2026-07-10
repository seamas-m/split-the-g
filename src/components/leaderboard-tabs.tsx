"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

interface PostEntry {
  id: string;
  imageUrl: string;
  pubName: string | null;
  city: string | null;
  username: string | null;
  nailedCount: number;
  notQuiteCount: number;
  isOwn: boolean;
}

interface CityEntry {
  city: string;
  splits: number;
  nailed: number;
}

interface LeaderboardTabsProps {
  weekly: PostEntry[];
  allTime: PostEntry[];
  cities: CityEntry[];
}

const MEDALS = ["🥇", "🥈", "🥉"];

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    return (
      <span className="text-xl w-8 text-center shrink-0 leading-none">
        {MEDALS[rank - 1]}
      </span>
    );
  }
  return (
    <span className="text-xs text-foam/50 font-mono w-8 text-center shrink-0">
      {rank}
    </span>
  );
}

function PostRow({ entry, rank }: { entry: PostEntry; rank: number }) {
  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 border-b border-malt/40 last:border-0",
      entry.isOwn && "bg-harp/5"
    )}>
      <RankBadge rank={rank} />

      {/* Thumbnail — links to pub page if available */}
      <Link
        href={entry.pubName ? `/pub/${encodeURIComponent(entry.pubName)}` : `/feed`}
        className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-malt/50"
      >
        <Image src={entry.imageUrl} alt="Split" fill className="object-cover" />
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col gap-0.5">
          {entry.pubName ? (
            <Link
              href={`/pub/${encodeURIComponent(entry.pubName)}`}
              className="text-sm font-semibold text-cream truncate leading-tight hover:text-harp transition-colors"
            >
              {entry.pubName}
            </Link>
          ) : (
            <span className="text-sm text-foam/40 italic leading-tight">No location</span>
          )}
          {entry.city && (
            <Link
              href={`/search?city=${encodeURIComponent(entry.city)}`}
              className="flex items-center gap-1 text-xs text-foam/60 hover:text-harp transition-colors w-fit"
            >
              <MapPin size={10} /> {entry.city}
            </Link>
          )}
          <Link
            href={`/profile/${entry.username}`}
            className="text-xs text-foam/50 hover:text-foam transition-colors mt-0.5"
          >
            @{entry.username ?? "anon"}
          </Link>
        </div>
      </div>

      {/* Score */}
      <div className="flex flex-col items-end shrink-0">
        <span className="flex items-center gap-1 text-sm font-bold text-harp">
          <span className="text-harp/70 text-xs">✓</span>
          {entry.nailedCount}
        </span>
        {entry.notQuiteCount > 0 && (
          <span className="text-xs text-foam/40">{entry.notQuiteCount} not quite</span>
        )}
      </div>
    </div>
  );
}

function CityRow({ entry, rank }: { entry: CityEntry; rank: number }) {
  return (
    <Link
      href={`/search?city=${encodeURIComponent(entry.city)}`}
      className="flex items-center gap-3 px-4 py-3 border-b border-malt/40 last:border-0 hover:bg-malt/10 transition-colors"
    >
      <RankBadge rank={rank} />

      <div className="flex-1 min-w-0">
        <span className="text-sm font-semibold text-cream">{entry.city}</span>
        <p className="text-xs text-foam/50 mt-0.5">{entry.splits} split{entry.splits !== 1 ? "s" : ""} posted</p>
      </div>

      <div className="flex flex-col items-end shrink-0">
        <span className="flex items-center gap-1 text-sm font-bold text-harp">
          <span className="text-harp/70 text-xs">✓</span>
          {entry.nailed}
        </span>
        <span className="text-xs text-foam/40">nailed it</span>
      </div>
    </Link>
  );
}

function EmptyState({ tab }: { tab: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-2">
      <p className="text-cream font-semibold text-sm">No splits here yet</p>
      <p className="text-foam/60 text-xs">
        {tab === "weekly"
          ? "Be the first to get a nailed it vote this week."
          : tab === "alltime"
          ? "Start voting on splits to build the leaderboard."
          : "Post splits with a city to appear here."}
      </p>
      <Link
        href="/feed"
        className="mt-3 text-xs text-harp hover:underline"
      >
        Go to feed →
      </Link>
    </div>
  );
}

export default function LeaderboardTabs({ weekly, allTime, cities }: LeaderboardTabsProps) {
  const [tab, setTab] = useState<"weekly" | "alltime" | "cities">("weekly");

  const tabs = [
    { id: "weekly" as const, label: "This Week" },
    { id: "alltime" as const, label: "All Time" },
    { id: "cities" as const, label: "Cities" },
  ];

  return (
    <>
      {/* Tab bar */}
      <div className="flex gap-1 mx-4 my-4 bg-porter border border-malt rounded-xl p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
              tab === t.id ? "bg-harp text-cream" : "text-foam hover:text-cream"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-porter border border-malt rounded-2xl mx-4 overflow-hidden">
        {tab === "weekly" && (
          weekly.length === 0
            ? <EmptyState tab="weekly" />
            : weekly.map((e, i) => <PostRow key={e.id} entry={e} rank={i + 1} />)
        )}
        {tab === "alltime" && (
          allTime.length === 0
            ? <EmptyState tab="alltime" />
            : allTime.map((e, i) => <PostRow key={e.id} entry={e} rank={i + 1} />)
        )}
        {tab === "cities" && (
          cities.length === 0
            ? <EmptyState tab="cities" />
            : cities.map((e, i) => <CityRow key={e.city} entry={e} rank={i + 1} />)
        )}
      </div>
    </>
  );
}
