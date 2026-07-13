/*
  Warnings:

  - The primary key for the `AppSettings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `AppSettings` table. All the data in the column will be lost.
  - Added the required column `userId` to the `AppSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `FinishPreset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Printer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Resin` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "subscriptionStartsAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subscriptionEndsAt" DATETIME,
    "lastLoginAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AppSettings" (
    "userId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyName" TEXT,
    "kwhCost" REAL NOT NULL DEFAULT 1.14,
    "defaultProfitPercent" REAL NOT NULL DEFAULT 100,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AppSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AppSettings" ("companyName", "createdAt", "currency", "defaultProfitPercent", "kwhCost", "notes", "updatedAt") SELECT "companyName", "createdAt", "currency", "defaultProfitPercent", "kwhCost", "notes", "updatedAt" FROM "AppSettings";
DROP TABLE "AppSettings";
ALTER TABLE "new_AppSettings" RENAME TO "AppSettings";
CREATE TABLE "new_FinishPreset" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fixedCost" REAL NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FinishPreset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FinishPreset" ("createdAt", "description", "fixedCost", "id", "isActive", "name", "updatedAt") SELECT "createdAt", "description", "fixedCost", "id", "isActive", "name", "updatedAt" FROM "FinishPreset";
DROP TABLE "FinishPreset";
ALTER TABLE "new_FinishPreset" RENAME TO "FinishPreset";
CREATE UNIQUE INDEX "FinishPreset_userId_name_key" ON "FinishPreset"("userId", "name");
CREATE TABLE "new_Printer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT,
    "powerWatts" REAL NOT NULL,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Printer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Printer" ("createdAt", "id", "isActive", "model", "name", "notes", "powerWatts", "updatedAt") SELECT "createdAt", "id", "isActive", "model", "name", "notes", "powerWatts", "updatedAt" FROM "Printer";
DROP TABLE "Printer";
ALTER TABLE "new_Printer" RENAME TO "Printer";
CREATE UNIQUE INDEX "Printer_userId_name_key" ON "Printer"("userId", "name");
CREATE TABLE "new_Quote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "modelName" TEXT NOT NULL,
    "customerName" TEXT,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'QUOTE',
    "materialType" TEXT NOT NULL DEFAULT 'RESIN',
    "driveLink" TEXT,
    "notes" TEXT,
    "freightNotes" TEXT,
    "heightMm" REAL NOT NULL DEFAULT 0,
    "widthMm" REAL NOT NULL DEFAULT 0,
    "depthMm" REAL NOT NULL DEFAULT 0,
    "resinMl" REAL NOT NULL DEFAULT 0,
    "printTimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "resinId" INTEGER,
    "resinNameSnapshot" TEXT NOT NULL,
    "resinCostPerMlSnapshot" REAL NOT NULL,
    "printerId" INTEGER,
    "printerNameSnapshot" TEXT NOT NULL,
    "printerPowerWattsSnapshot" REAL NOT NULL,
    "finishPresetId" INTEGER,
    "finishNameSnapshot" TEXT NOT NULL,
    "finishCostSnapshot" REAL NOT NULL,
    "materialCost" REAL NOT NULL,
    "energyCost" REAL NOT NULL,
    "finishCost" REAL NOT NULL,
    "freightCost" REAL NOT NULL,
    "totalCost" REAL NOT NULL,
    "pricingMode" TEXT NOT NULL DEFAULT 'PERCENT',
    "profitPercent" REAL NOT NULL,
    "profitValue" REAL NOT NULL,
    "finalPrice" REAL NOT NULL,
    "unitCost" REAL NOT NULL,
    "unitPrice" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Quote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Quote_resinId_fkey" FOREIGN KEY ("resinId") REFERENCES "Resin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Quote_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "Printer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Quote_finishPresetId_fkey" FOREIGN KEY ("finishPresetId") REFERENCES "FinishPreset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Quote" ("createdAt", "customerName", "depthMm", "description", "driveLink", "energyCost", "finalPrice", "finishCost", "finishCostSnapshot", "finishNameSnapshot", "finishPresetId", "freightCost", "freightNotes", "heightMm", "id", "materialCost", "materialType", "modelName", "notes", "pricingMode", "printTimeMinutes", "printerId", "printerNameSnapshot", "printerPowerWattsSnapshot", "profitPercent", "profitValue", "quantity", "resinCostPerMlSnapshot", "resinId", "resinMl", "resinNameSnapshot", "status", "totalCost", "unitCost", "unitPrice", "updatedAt", "widthMm") SELECT "createdAt", "customerName", "depthMm", "description", "driveLink", "energyCost", "finalPrice", "finishCost", "finishCostSnapshot", "finishNameSnapshot", "finishPresetId", "freightCost", "freightNotes", "heightMm", "id", "materialCost", "materialType", "modelName", "notes", "pricingMode", "printTimeMinutes", "printerId", "printerNameSnapshot", "printerPowerWattsSnapshot", "profitPercent", "profitValue", "quantity", "resinCostPerMlSnapshot", "resinId", "resinMl", "resinNameSnapshot", "status", "totalCost", "unitCost", "unitPrice", "updatedAt", "widthMm" FROM "Quote";
DROP TABLE "Quote";
ALTER TABLE "new_Quote" RENAME TO "Quote";
CREATE INDEX "Quote_userId_idx" ON "Quote"("userId");
CREATE INDEX "Quote_status_idx" ON "Quote"("status");
CREATE INDEX "Quote_createdAt_idx" ON "Quote"("createdAt");
CREATE INDEX "Quote_modelName_idx" ON "Quote"("modelName");
CREATE INDEX "Quote_customerName_idx" ON "Quote"("customerName");
CREATE TABLE "new_Resin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "manufacturer" TEXT,
    "color" TEXT,
    "purchasePrice" REAL NOT NULL,
    "purchaseUnit" TEXT NOT NULL,
    "purchaseQuantity" REAL NOT NULL,
    "density" REAL,
    "calculatedCostPerMl" REAL NOT NULL,
    "manualCostPerMl" REAL,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Resin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Resin" ("calculatedCostPerMl", "color", "createdAt", "density", "id", "isActive", "manualCostPerMl", "manufacturer", "name", "notes", "purchasePrice", "purchaseQuantity", "purchaseUnit", "updatedAt") SELECT "calculatedCostPerMl", "color", "createdAt", "density", "id", "isActive", "manualCostPerMl", "manufacturer", "name", "notes", "purchasePrice", "purchaseQuantity", "purchaseUnit", "updatedAt" FROM "Resin";
DROP TABLE "Resin";
ALTER TABLE "new_Resin" RENAME TO "Resin";
CREATE UNIQUE INDEX "Resin_userId_name_key" ON "Resin"("userId", "name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
