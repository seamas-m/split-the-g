"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Bell, X } from "lucide-react";
import { timeAgo } from "@/lib/time";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "nailed" | "comment";
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
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function toggleOpen() {
    if (open) { setOpen(false); return; }
    setOpen(true);
    await fetchNotifications();
    if (unreadCount > 0) {
      await fetch("/api/notifications", { method: "POST" });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }

  // Position dropdown below the button using its bounding rect
  const rect = buttonRef.current?.getBoundingClientRect();
  const dropdownStyle = rect
    ? { top: rect.bottom + 8, right: window.innerWidth - rect.right }
    : { top: 68, right: 20 };

  const dropdown = (
    <div
      className="fixed z-[60] w-80 bg-porter border border-malt rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      style={dropdownStyle}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-malt">
        <span className="text-sm font-semibold text-cream">Activity</span>
        <button onClick={() => setOpen(false)} className="text-foam hover:text-cream transition-colors">
          <X size={15} />
        </button>
      </div>

      {/* Content */}
      <div className="overflow-y-auto max-h-[min(420px,60vh)]">
        {loading && notifications.length === 0 && (
          <p className="text-foam text-xs text-center py-6">Loading…</p>
        )}
        {!loading && notifications.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-8 px-4 text-center">
            <Bell size={24} className="text-malt" />
            <p className="text-cream text-sm font-medium">No activity yet</p>
            <p className="text-foam text-xs leading-relaxed">
              When someone votes on your split or comments, you&apos;ll see it here.
            </p>
          </div>
        )}
        {notifications.map((n) => {
          const actorName = n.actor.username ?? n.actor.name;
          return (
            <div
              key={n.id}
              className={cn(
                "flex items-center gap-3 px-4 py-3 border-b border-malt/40 last:border-0",
                !n.read && "bg-harp/5"
              )}
            >
              <div className="w-7 h-7 rounded-full bg-malt flex items-center justify-center text-xs font-bold text-harp shrink-0">
                {actorName[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-cream leading-snug">
                  <span className="font-semibold">{actorName}</span>
                  {n.type === "nailed"
                    ? <> said you nailed it{n.post.pubName ? ` at ${n.post.pubName}` : ""}</>
                    : <> commented on your pint{n.post.pubName ? ` at ${n.post.pubName}` : ""}</>
                  }
                </p>
                {n.type === "comment" && n.body && (
                  <p className="text-[11px] text-foam mt-0.5 truncate">&ldquo;{n.body}&rdquo;</p>
                )}
                <p className="text-[11px] text-foam/50 mt-0.5">{timeAgo(n.createdAt)}</p>
              </div>
              <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0">
                <Image src={n.post.imageUrl} alt="Post" fill className="object-cover" />
              </div>
              {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-harp shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleOpen}
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

      {mounted && open && createPortal(dropdown, document.body)}
    </>
  );
}
