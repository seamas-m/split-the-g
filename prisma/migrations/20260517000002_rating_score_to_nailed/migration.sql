-- Rename Rating.score (Int 0 or 1) to Rating.nailed (Boolean)
-- Data was already binary; Zod validation on POST /api/ratings enforces vote in ("nailed","notquite")

ALTER TABLE "Rating" ADD COLUMN "nailed" BOOLEAN;

UPDATE "Rating" SET "nailed" = ("score" = 1);

ALTER TABLE "Rating" ALTER COLUMN "nailed" SET NOT NULL;

ALTER TABLE "Rating" DROP COLUMN "score";
