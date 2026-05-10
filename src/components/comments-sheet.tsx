"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Trash2 } from "lucide-react";
import { timeAgo } from "@/lib/time";
import { useSession } from "@/lib/auth-client";

interface Comment {
  id: string;
  text: string;
  createdAt: string;
  userId: string;
  user: { username: string | null; name: string };
}

interface CommentsSheetProps {
  postId: string;
  initialCount: number;
}

export default function CommentsSheet({ postId, initialCount }: CommentsSheetProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [count, setCount] = useState(initialCount);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function fetchComments() {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      const data = await res.json();
      setComments(data);
      setCount(data.length);
    } finally {
      setLoading(false);
    }
  }

  function openSheet() {
    setOpen(true);
    fetchComments();
  }

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
    }
  }, [open, comments.length]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments((prev) => [...prev, newComment]);
        setCount((c) => c + 1);
        setText("");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(commentId: string) {
    await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setCount((c) => c - 1);
  }

  return (
    <>
      {/* Comment count button */}
      <button
        onClick={openSheet}
        className="flex items-center gap-1.5 text-foam hover:text-cream transition-colors"
      >
        <MessageCircle size={17} />
        <span className="text-xs">{count > 0 ? count : ""}</span>
      </button>

      {/* Bottom sheet */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-stout/80 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Sheet — sits above navbar (h-16 = 64px) */}
          <div className="relative bg-porter border-t border-malt rounded-t-2xl w-full max-w-lg flex flex-col shadow-xl mb-16"
               style={{ height: "70vh" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-malt shrink-0">
              <h2 className="font-semibold text-cream text-sm">Comments</h2>
              <button onClick={() => setOpen(false)} className="text-foam hover:text-cream transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
              {loading && (
                <p className="text-foam text-sm text-center py-8">Loading…</p>
              )}
              {!loading && comments.length === 0 && (
                <p className="text-foam text-sm text-center py-8 italic">No comments yet. Be the first.</p>
              )}
              {comments.map((comment) => {
                const isOwn = session?.user?.id === comment.userId;
                const displayName = comment.user.username ?? comment.user.name;
                return (
                  <div key={comment.id} className="flex gap-3 group">
                    <div className="w-7 h-7 rounded-full bg-malt flex items-center justify-center text-xs font-bold text-harp shrink-0 mt-0.5">
                      {displayName[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-cream">{displayName}</span>
                        <span className="text-xs text-foam/60">{timeAgo(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-cream/90 mt-0.5 break-words">{comment.text}</p>
                    </div>
                    {isOwn && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="opacity-0 group-hover:opacity-100 text-foam hover:text-red-400 transition-all shrink-0 mt-0.5"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            {session ? (
              <form
                onSubmit={handleSubmit}
                className="shrink-0 flex items-center gap-3 px-4 py-3 border-t border-malt"
              >
                <div className="w-7 h-7 rounded-full bg-malt flex items-center justify-center text-xs font-bold text-harp shrink-0">
                  {((session.user.name ?? session.user.email ?? "?")[0]).toUpperCase()}
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Add a comment…"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-cream placeholder-foam/50 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!text.trim() || submitting}
                  className="text-harp disabled:opacity-30 transition-opacity"
                >
                  <Send size={17} />
                </button>
              </form>
            ) : (
              <p className="shrink-0 text-xs text-foam text-center py-3 border-t border-malt">
                Sign in to comment
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
