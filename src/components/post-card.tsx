import Image from "next/image";
import PintRating from "./pint-rating";
import { MapPin, Clock } from "lucide-react";

interface PostCardProps {
  post: {
    id: string;
    imageUrl: string;
    pubName: string | null;
    city: string | null;
    settleSeconds: number | null;
    createdAt: string;
    user: { username: string | null; image: string | null };
    avgScore: number;
    totalRatings: number;
    userScore?: number;
  };
}

function formatSettle(s: number) {
  if (s < 60) return `${s}s settle`;
  return `${Math.floor(s / 60)}m ${s % 60}s settle`;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
      <div className="relative aspect-[3/4] w-full">
        <Image
          src={post.imageUrl}
          alt={`Pint at ${post.pubName ?? "unknown pub"}`}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold text-amber-400">
            {(post.user.username ?? "?")[0].toUpperCase()}
          </div>
          <span className="font-semibold text-sm">{post.user.username ?? "anon"}</span>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-400">
          {post.pubName && (
            <span className="font-medium text-white">{post.pubName}</span>
          )}
          {post.city && (
            <span className="flex items-center gap-1">
              <MapPin size={13} /> {post.city}
            </span>
          )}
          {post.settleSeconds != null && (
            <span className="flex items-center gap-1">
              <Clock size={13} /> {formatSettle(post.settleSeconds)}
            </span>
          )}
        </div>

        <PintRating
          postId={post.id}
          avgScore={post.avgScore}
          totalRatings={post.totalRatings}
          userScore={post.userScore}
        />
      </div>
    </article>
  );
}
