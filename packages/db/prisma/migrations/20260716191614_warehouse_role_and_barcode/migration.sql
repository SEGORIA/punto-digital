-- AlterEnum
ALTER TYPE "AdminRole" ADD VALUE 'WAREHOUSE';

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "barcode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_barcode_key" ON "ProductVariant"("barcode");
