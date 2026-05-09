"use client";

import { timeAgo } from "@/lib/time";

export default function TimeAgo({ date }: { date: string }) {
  return (
    <span className="text-xs text-foam/60" title={new Date(date).toLocaleString()}>
      {timeAgo(date)}
    </span>
  );
}
