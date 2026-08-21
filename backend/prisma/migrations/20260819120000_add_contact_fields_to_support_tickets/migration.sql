-- AlterTable
ALTER TABLE "support_tickets" ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "support_tickets" ADD COLUMN "name" TEXT,
ADD COLUMN "phone" TEXT;
