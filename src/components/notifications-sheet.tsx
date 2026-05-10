"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Bell, X } from "lucide-react";
import { timeAgo } from "@/lib/time";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "cheers" | "comment";
  body: string | null;
  read: boolean;
  createdAt: string;
  actor: { username: string | null; name: string };
  post: { id: string; imageUrl: string; pubName: string | null };
}

export default function NotificationsSheet() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll every 30s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  async function openSheet() {
    setOpen(true);
    await fetchNotifications();
    if (unreadCount > 0) {
      await fetch("/api/notifications", { method: "POST" });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }

  const sheet = (
    <div className="fixed inset-x-0 bottom-0 top-[60px] z-[60] flex items-end justify-center">
      <div className="absolute inset-0 bg-stout/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div
        className="relative bg-porter border-t border-malt rounded-t-2xl w-full max-w-lg flex flex-col shadow-xl mb-16"
        style={{ height: "70vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-malt shrink-0">
          <h2 className="font-semibold text-cream text-sm">Activity</h2>
          <button onClick={() => setOpen(false)} className="text-foam hover:text-cream transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading && notifications.length === 0 && (
            <p className="text-foam text-sm text-center py-8">Loading…</p>
          )}
          {!loading && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 px-8 text-center">
              <Bell size={32} className="text-malt" />
              <p className="text-cream text-sm font-medium">No activity yet</p>
              <p className="text-foam text-xs leading-relaxed">
                When someone cheers or comments on your pint, you&apos;ll see it here.
              </p>
            </div>
          )}
          {notifications.map((n) => {
            const actorName = n.actor.username ?? n.actor.name;
            return (
              <div
                key={n.id}
                className={cn(
                  "flex items-center gap-3 px-5 py-3.5 border-b border-malt/40 last:border-0 transition-colors",
                  !n.read && "bg-harp/5"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-malt flex items-center justify-center text-xs font-bold text-harp shrink-0">
                  {actorName[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-cream leading-snug">
                    <span className="font-semibold">{actorName}</span>
                    {n.type === "cheers" ? (
                      <> cheersed your pint{n.post.pubName ? ` at ${n.post.pubName}` : ""}</>
                    ) : (
                      <> commented on your pint{n.post.pubName ? ` at ${n.post.pubName}` : ""}</>
                    )}
                  </p>
                  {n.type === "comment" && n.body && (
                    <p className="text-xs text-foam mt-0.5 truncate">&ldquo;{n.body}&rdquo;</p>
                  )}
                  <p className="text-xs text-foam/50 mt-0.5">{timeAgo(n.createdAt)}</p>
                </div>
                <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                  <Image src={n.post.imageUrl} alt="Post" fill className="object-cover" />
                </div>
                {!n.read && (
                  <div className="w-1.5 h-1.5 rounded-full bg-harp shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={openSheet}
        className="relative flex flex-col items-center gap-0.5 text-foam hover:text-harp transition-colors"
        aria-label="Notifications"
      >
        <div className="relative">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-harp text-stout text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
        <span className="text-[10px] leading-none">Activity</span>
      </button>

      {/* Portal renders outside the header so backdrop-filter doesn't trap fixed positioning */}
      {mounted && open && createPortal(sheet, document.body)}
    </>
  );
}
