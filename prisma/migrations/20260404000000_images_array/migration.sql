-- AlterTable: convert image to images array
ALTER TABLE "Product" ADD COLUMN "images" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Migrate existing data
UPDATE "Product" SET "images" = ARRAY["image"] WHERE "image" IS NOT NULL;

-- Drop old column
ALTER TABLE "Product" DROP COLUMN IF EXISTS "image";
