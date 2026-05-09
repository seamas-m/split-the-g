import Image from "next/image";
import PintRating from "./pint-rating";
import PostActions from "./post-actions";
import { MapPin } from "lucide-react";

interface PostCardProps {
  post: {
    id: string;
    imageUrl: string;
    pubName: string | null;
    city: string | null;
    createdAt: string;
    user: { username: string | null; image: string | null };
    avgScore: number;
    totalRatings: number;
    userScore?: number;
  };
  isOwner?: boolean;
}

export default function PostCard({ post, isOwner }: PostCardProps) {
  return (
    <article className="bg-porter rounded-2xl overflow-hidden border border-malt">
      <div className="relative aspect-[3/4] w-full">
        <Image
          src={post.imageUrl}
          alt={`Pint at ${post.pubName ?? "unknown pub"}`}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-malt flex items-center justify-center text-sm font-bold text-harp">
              {(post.user.username ?? "?")[0].toUpperCase()}
            </div>
            <span className="font-medium text-sm text-cream">{post.user.username ?? "anon"}</span>
          </div>
          {isOwner && (
            <PostActions postId={post.id} pubName={post.pubName} city={post.city} />
          )}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {post.pubName && (
            <span className="font-semibold text-cream">{post.pubName}</span>
          )}
          {post.city && (
            <span className="flex items-center gap-1 text-foam">
              <MapPin size={13} /> {post.city}
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
