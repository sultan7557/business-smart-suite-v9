-- Add document assignment fields to SupplierDocument table
ALTER TABLE "SupplierDocument" ADD COLUMN "assignedUserId" TEXT;
ALTER TABLE "SupplierDocument" ADD COLUMN "lastNotificationSent" TIMESTAMP(3);

-- Add foreign key constraint for assignedUserId
ALTER TABLE "SupplierDocument" ADD CONSTRAINT "SupplierDocument_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create DocumentNotificationSettings table
CREATE TABLE "DocumentNotificationSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notification30Days" BOOLEAN NOT NULL DEFAULT true,
    "notification14Days" BOOLEAN NOT NULL DEFAULT true,
    "notification7Days" BOOLEAN NOT NULL DEFAULT true,
    "notification1Day" BOOLEAN NOT NULL DEFAULT true,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentNotificationSettings_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on userId
CREATE UNIQUE INDEX "DocumentNotificationSettings_userId_key" ON "DocumentNotificationSettings"("userId");

-- Add foreign key constraint for userId
ALTER TABLE "DocumentNotificationSettings" ADD CONSTRAINT "DocumentNotificationSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

