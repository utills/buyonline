-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "eldestMemberAge" INTEGER,
ADD COLUMN     "kidsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "selfSelected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "spouseSelected" BOOLEAN NOT NULL DEFAULT false;
