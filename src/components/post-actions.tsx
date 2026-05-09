"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2, X, Check } from "lucide-react";

interface PostActionsProps {
  postId: string;
  pubName: string | null;
  city: string | null;
}

export default function PostActions({ postId, pubName, city }: PostActionsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"menu" | "edit" | "delete">("menu");
  const [editPub, setEditPub] = useState(pubName ?? "");
  const [editCity, setEditCity] = useState(city ?? "");
  const [loading, setLoading] = useState(false);

  function reset() {
    setOpen(false);
    setMode("menu");
    setEditPub(pubName ?? "");
    setEditCity(city ?? "");
  }

  async function handleDelete() {
    setLoading(true);
    try {
      await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
      reset();
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pubName: editPub || null, city: editCity || null }),
      });
      router.refresh();
    } finally {
      setLoading(false);
      reset();
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="p-1 rounded-lg text-foam hover:text-cream hover:bg-malt transition-colors"
        aria-label="Post options"
      >
        <MoreHorizontal size={18} />
      </button>
    );
  }

  if (mode === "delete") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-foam">Delete post?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
        >
          <Check size={14} /> Yes
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-1 text-xs text-foam hover:text-cream transition-colors"
        >
          <X size={14} /> No
        </button>
      </div>
    );
  }

  if (mode === "edit") {
    return (
      <form onSubmit={handleEdit} className="flex flex-col gap-2 w-full">
        <input
          type="text"
          placeholder="Pub name"
          value={editPub}
          onChange={(e) => setEditPub(e.target.value)}
          className="bg-stout border border-malt rounded-lg px-3 py-1.5 text-cream placeholder-foam/60 focus:outline-none focus:border-harp transition-colors text-xs w-full"
        />
        <input
          type="text"
          placeholder="City"
          value={editCity}
          onChange={(e) => setEditCity(e.target.value)}
          className="bg-stout border border-malt rounded-lg px-3 py-1.5 text-cream placeholder-foam/60 focus:outline-none focus:border-harp transition-colors text-xs w-full"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-harp text-stout text-xs font-bold py-1.5 rounded-lg disabled:opacity-50"
          >
            {loading ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={reset}
            className="flex-1 border border-malt text-foam text-xs py-1.5 rounded-lg hover:text-cream transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  // Menu
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setMode("edit")}
        className="flex items-center gap-1 text-xs text-foam hover:text-cream transition-colors px-2 py-1 rounded-lg hover:bg-malt"
      >
        <Pencil size={13} /> Edit
      </button>
      <button
        onClick={() => setMode("delete")}
        className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded-lg hover:bg-malt"
      >
        <Trash2 size={13} /> Delete
      </button>
      <button onClick={reset} className="p-1 text-foam hover:text-cream transition-colors">
        <X size={14} />
      </button>
    </div>
  );
}
