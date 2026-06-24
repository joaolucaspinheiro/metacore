-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "species" TEXT[] DEFAULT ARRAY[]::TEXT[];
