import Image from "next/image";
import Link from "next/link";
import CheersButton from "./cheers-button";
import PostActions from "./post-actions";
import CommentsSheet from "./comments-sheet";
import TimeAgo from "./time-ago";
import { MapPin } from "lucide-react";

interface PostCardProps {
  post: {
    id: string;
    imageUrl: string;
    pubName: string | null;
    city: string | null;
    createdAt: string;
    userId: string;
    user: { username: string | null; image: string | null };
    totalCheers: number;
    hasCheersed: boolean;
    totalComments: number;
    userScore?: number;
  };
  isOwner?: boolean;
}

export default function PostCard({ post, isOwner }: PostCardProps) {
  return (
    <article className="relative bg-porter rounded-2xl overflow-hidden border border-malt">
      <div className="relative aspect-[3/4] w-full">
        <Image
          src={post.imageUrl}
          alt={`Pint at ${post.pubName ?? "unknown pub"}`}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-4 flex flex-col gap-2">
        {/* Pub name — most prominent */}
        {post.pubName && (
          <div className="flex items-start justify-between gap-2">
            <span className="font-bold text-base text-cream leading-tight">{post.pubName}</span>
            {isOwner && (
              <PostActions postId={post.id} imageUrl={post.imageUrl} pubName={post.pubName} city={post.city} />
            )}
          </div>
        )}

        {/* City */}
        {post.city && (
          <span className="flex items-center gap-1 text-xs text-foam">
            <MapPin size={11} /> {post.city}
          </span>
        )}

        {/* If no pub name, show actions in the row with the user */}
        <div className="flex items-center justify-between mt-1">
          <Link
            href={`/profile/${post.user.username}`}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-6 h-6 rounded-full bg-malt flex items-center justify-center text-xs font-bold text-harp">
              {(post.user.username ?? "?")[0].toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-foam leading-tight">{post.user.username ?? "anon"}</span>
              <TimeAgo date={post.createdAt} />
            </div>
          </Link>
          {!post.pubName && isOwner && (
            <PostActions postId={post.id} imageUrl={post.imageUrl} pubName={post.pubName} city={post.city} />
          )}
        </div>

        {/* Actions row */}
        <div className="flex items-center gap-4 pt-1 border-t border-malt/50">
          <CheersButton
            postId={post.id}
            totalCheers={post.totalCheers}
            hasCheersed={post.hasCheersed}
          />
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
  );
}
