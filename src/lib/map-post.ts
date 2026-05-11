type RawRating = { score: number; userId: string };

type RawPost = {
  id: string;
  imageUrl: string;
  pubName: string | null;
  city: string | null;
  aiScore: number | null;
  createdAt: Date;
  userId: string;
  user: { username: string | null; image: string | null };
  ratings: RawRating[];
  comments: { id: string }[];
};

export function mapPost(p: RawPost, currentUserId: string | null) {
  const myRating = currentUserId ? p.ratings.find((r) => r.userId === currentUserId) : null;
  return {
    id: p.id,
    imageUrl: p.imageUrl,
    pubName: p.pubName,
    city: p.city,
    createdAt: p.createdAt.toISOString(),
    userId: p.userId,
    user: p.user,
    aiScore: p.aiScore,
    nailedCount: p.ratings.filter((r) => r.score === 1).length,
    notQuiteCount: p.ratings.filter((r) => r.score === 0).length,
    userVote: myRating == null ? null : myRating.score === 1 ? ("nailed" as const) : ("notquite" as const),
    totalComments: p.comments.length,
    isOwner: currentUserId === p.userId,
  };
}

export type MappedPost = ReturnType<typeof mapPost>;
