-- Add missing indexes for observed query patterns
-- All indexes are additive and backward-compatible

-- Post userId used by profile page
CREATE INDEX IF NOT EXISTS "Post_userId_idx" ON "Post"("userId");

-- Post createdAt used by feed cursor pagination
CREATE INDEX IF NOT EXISTS "Post_createdAt_idx" ON "Post"("createdAt" DESC);

-- Post city used by search filter and leaderboard groupBy
CREATE INDEX IF NOT EXISTS "Post_city_idx" ON "Post"("city");

-- Post pubName used by trending groupBy (case-sensitive only)
CREATE INDEX IF NOT EXISTS "Post_pubName_idx" ON "Post"("pubName");

-- Notification activity dropdown fetches recipient newest 30
CREATE INDEX IF NOT EXISTS "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt" DESC);

-- Follow reverse lookup for profile follower counts
CREATE INDEX IF NOT EXISTS "Follow_followingId_idx" ON "Follow"("followingId");

-- Comment fetched by postId in the comments sheet
CREATE INDEX IF NOT EXISTS "Comment_postId_idx" ON "Comment"("postId");
