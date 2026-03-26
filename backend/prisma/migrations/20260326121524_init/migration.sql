-- CreateTable
CREATE TABLE "RateRequest" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "originZip" TEXT NOT NULL,
    "destZip" TEXT NOT NULL,
    "weightLbs" DOUBLE PRECISION NOT NULL,
    "lengthIn" DOUBLE PRECISION,
    "widthIn" DOUBLE PRECISION,
    "heightIn" DOUBLE PRECISION,
    "serviceCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateQuote" (
    "id" TEXT NOT NULL,
    "carrier" TEXT NOT NULL,
    "serviceCode" TEXT NOT NULL,
    "serviceLabel" TEXT NOT NULL,
    "totalCharge" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "estimatedDays" INTEGER,
    "rateRequestId" TEXT NOT NULL,

    CONSTRAINT "RateQuote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthToken" (
    "id" TEXT NOT NULL,
    "carrier" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RateRequest_sessionId_idx" ON "RateRequest"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "AuthToken_carrier_key" ON "AuthToken"("carrier");

-- AddForeignKey
ALTER TABLE "RateQuote" ADD CONSTRAINT "RateQuote_rateRequestId_fkey" FOREIGN KEY ("rateRequestId") REFERENCES "RateRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
