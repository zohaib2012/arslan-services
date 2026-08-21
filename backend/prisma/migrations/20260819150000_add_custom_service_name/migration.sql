-- AlterTable
ALTER TABLE "worker_services" ALTER COLUMN "service_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "worker_services" ADD COLUMN "custom_service_name" TEXT;
