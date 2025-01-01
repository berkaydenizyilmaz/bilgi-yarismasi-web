/*
  Warnings:

  - Added the required column `action` to the `Log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `module` to the `Log` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Log_level_idx";

-- DropIndex
DROP INDEX "Log_timestamp_idx";

-- DropIndex
DROP INDEX "Log_user_id_idx";

-- AlterTable
ALTER TABLE "Log" ADD COLUMN     "action" TEXT NOT NULL,
ADD COLUMN     "module" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Log_timestamp_idx" ON "Log"("timestamp" DESC);
