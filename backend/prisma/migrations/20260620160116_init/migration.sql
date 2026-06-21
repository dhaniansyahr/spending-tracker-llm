-- CreateEnum
CREATE TYPE "Category" AS ENUM ('FOOD_DINING', 'TRANSPORTATION', 'ENTERTAINMENT', 'SHOPPING', 'OTHERS');

-- CreateEnum
CREATE TYPE "Source" AS ENUM ('MANUAL', 'FREE_TEXT', 'RECEIPT');

-- CreateTable
CREATE TABLE "spendings" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "category" "Category" NOT NULL,
    "source" "Source" NOT NULL DEFAULT 'MANUAL',
    "note" TEXT,
    "receiptUrl" TEXT,
    "rawText" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spendings_pkey" PRIMARY KEY ("id")
);
