-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "mpPaymentId" TEXT,
ADD COLUMN     "mpStatusDetail" TEXT;

-- CreateIndex
CREATE INDEX "Order_mpPaymentId_idx" ON "Order"("mpPaymentId");
