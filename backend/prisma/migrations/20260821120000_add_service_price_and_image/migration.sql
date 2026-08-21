-- AlterTable
ALTER TABLE "worker_services" ADD COLUMN "price_min" DECIMAL(12,2);
ALTER TABLE "worker_services" ADD COLUMN "price_max" DECIMAL(12,2);

-- AlterTable
ALTER TABLE "services" ADD COLUMN "image_url" TEXT;
