"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SplitVote from "./split-vote";
import PostActions from "./post-actions";
import CommentsSheet from "./comments-sheet";
import ImageLightbox from "./image-lightbox";
import TimeAgo from "./time-ago";
import { MapPin } from "lucide-react";
import { scoreLabel } from "@/lib/utils";

interface PostCardProps {
  post: {
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
  };
  isOwner?: boolean;
  isPinned?: boolean;
}

export default function PostCard({ post, isOwner, isPinned }: PostCardProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <article className="relative bg-porter rounded-2xl overflow-hidden border border-malt">
        <div
          className="relative aspect-[3/4] w-full cursor-zoom-in"
          onClick={() => setLightboxOpen(true)}
        >
          <Image
            src={post.imageUrl}
            alt={`Pint at ${post.pubName ?? "unknown pub"}`}
            fill
            className="object-cover"
          />
          {isOwner && (
            <div
              className="absolute top-2.5 right-2.5"
              onClick={(e) => e.stopPropagation()}
            >
              <PostActions postId={post.id} imageUrl={post.imageUrl} pubName={post.pubName} city={post.city} isPinned={isPinned} />
            </div>
          )}
          {post.aiScore !== null && post.aiScore !== undefined && (
            <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-stout/80 backdrop-blur-sm rounded-full px-2.5 py-1 pointer-events-none">
              <span className="text-harp text-xs font-bold">{scoreLabel(post.aiScore)}</span>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col gap-2">
          {/* Location — consistent height */}
          <div className="min-h-[2.75rem] flex flex-col justify-center gap-0.5">
            {post.pubName ? (
              <Link
                href={`/pub/${encodeURIComponent(post.pubName)}`}
                className="font-bold text-base text-cream leading-tight hover:text-harp transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {post.pubName}
              </Link>
            ) : (
              <span className="text-sm text-foam/30 italic leading-tight">No location</span>
            )}
            {post.city && (
              <Link
                href={`/search?city=${encodeURIComponent(post.city)}`}
                className="flex items-center gap-1 text-xs text-foam hover:text-harp transition-colors w-fit"
                onClick={(e) => e.stopPropagation()}
              >
                <MapPin size={11} /> {post.city}
              </Link>
            )}
          </div>

          {/* User */}
          <Link href={`/profile/${post.user.username}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-6 h-6 rounded-full bg-malt flex items-center justify-center text-xs font-bold text-harp shrink-0">
              {(post.user.username ?? "?")[0].toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-foam leading-tight">{post.user.username ?? "anon"}</span>
              <TimeAgo date={post.createdAt} />
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center justify-between pt-1 border-t border-malt/50">
            {isOwner ? (
              <div className="flex items-center gap-2 text-xs text-foam/60">
                {post.nailedCount > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="text-harp/70">✓</span> {post.nailedCount} nailed it
                  </span>
                )}
                {post.nailedCount > 0 && post.notQuiteCount > 0 && <span>·</span>}
                {post.notQuiteCount > 0 && (
                  <span>{post.notQuiteCount} not quite</span>
                )}
                {post.nailedCount === 0 && post.notQuiteCount === 0 && (
                  <span className="italic">No votes yet</span>
                )}
              </div>
            ) : (
              <SplitVote
                postId={post.id}
                nailedCount={post.nailedCount}
                notQuiteCount={post.notQuiteCount}
                userVote={post.userVote}
              />
            )}
            <CommentsSheet
              postId={post.id}
              initialCount={post.totalComments}
              imageUrl={post.imageUrl}
              pubName={post.pubName}
              city={post.city}
              username={post.user.username}
            />
          </div>
        </div>
      </article>

      {lightboxOpen && (
        <ImageLightbox
          src={post.imageUrl}
          alt={`Pint at ${post.pubName ?? "unknown pub"}`}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
