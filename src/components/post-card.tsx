import Image from "next/image";
import Link from "next/link";
import SplitVote from "./split-vote";
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
    nailedCount: number;
    notQuiteCount: number;
    userVote: "nailed" | "notquite" | null;
    totalComments: number;
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
        {isOwner && (
          <div className="absolute top-2.5 right-2.5">
            <PostActions postId={post.id} imageUrl={post.imageUrl} pubName={post.pubName} city={post.city} />
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2">
        {/* Location — consistent height */}
        <div className="min-h-[2.75rem] flex flex-col justify-center gap-0.5">
          {post.pubName ? (
            <span className="font-bold text-base text-cream leading-tight">{post.pubName}</span>
          ) : (
            <span className="text-sm text-foam/30 italic leading-tight">No location</span>
          )}
          {post.city && (
            <span className="flex items-center gap-1 text-xs text-foam">
              <MapPin size={11} /> {post.city}
            </span>
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
          <SplitVote
            postId={post.id}
            nailedCount={post.nailedCount}
            notQuiteCount={post.notQuiteCount}
            userVote={post.userVote}
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
