"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2, X } from "lucide-react";

interface PostActionsProps {
  postId: string;
  pubName: string | null;
  city: string | null;
}

export default function PostActions({ postId, pubName, city }: PostActionsProps) {
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState<"edit" | "delete" | null>(null);
  const [editPub, setEditPub] = useState(pubName ?? "");
  const [editCity, setEditCity] = useState(city ?? "");
  const [loading, setLoading] = useState(false);

  function closeAll() {
    setMenu(false);
    setModal(null);
    setEditPub(pubName ?? "");
    setEditCity(city ?? "");
  }

  async function handleDelete() {
    setLoading(true);
    try {
      await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      router.refresh();
      closeAll();
    } finally {
      setLoading(false);
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
      closeAll();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setMenu((v) => !v)}
        className="p-1 rounded-lg text-foam hover:text-cream hover:bg-malt transition-colors"
        aria-label="Post options"
      >
        <MoreHorizontal size={18} />
      </button>

      {/* Inline dropdown menu — absolutely positioned, zero layout impact */}
      {menu && (
        <div className="absolute right-3 top-12 z-20 bg-porter border border-malt rounded-xl shadow-lg overflow-hidden flex flex-col min-w-[120px]">
          <button
            onClick={() => { setModal("edit"); setMenu(false); }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-cream hover:bg-malt transition-colors text-left"
          >
            <Pencil size={14} /> Edit
          </button>
          <button
            onClick={() => { setModal("delete"); setMenu(false); }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-malt transition-colors text-left"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}

      {/* Backdrop to close menu */}
      {menu && (
        <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
      )}

      {/* Modal — floats above everything, no layout impact on feed */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-stout/80 backdrop-blur-sm" onClick={closeAll} />

          {/* Dialog */}
          <div className="relative bg-porter border border-malt rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-cream">
                {modal === "edit" ? "Edit post" : "Delete post"}
              </h2>
              <button onClick={closeAll} className="text-foam hover:text-cream transition-colors">
                <X size={18} />
              </button>
            </div>

            {modal === "edit" && (
              <form onSubmit={handleEdit} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Pub name"
                  value={editPub}
                  onChange={(e) => setEditPub(e.target.value)}
                  className="bg-stout border border-malt rounded-xl px-4 py-3 text-cream placeholder-foam/60 focus:outline-none focus:border-harp transition-colors text-sm"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="bg-stout border border-malt rounded-xl px-4 py-3 text-cream placeholder-foam/60 focus:outline-none focus:border-harp transition-colors text-sm"
                />
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-harp text-stout font-bold py-3 rounded-xl disabled:opacity-50 text-sm tracking-wide"
                  >
                    {loading ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={closeAll}
                    className="flex-1 border border-malt text-foam py-3 rounded-xl hover:text-cream transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {modal === "delete" && (
              <div className="flex flex-col gap-4">
                <p className="text-foam text-sm">Are you sure you want to delete this post? This can't be undone.</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 text-sm"
                  >
                    {loading ? "Deleting…" : "Delete"}
                  </button>
                  <button
                    onClick={closeAll}
                    className="flex-1 border border-malt text-foam py-3 rounded-xl hover:text-cream transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
