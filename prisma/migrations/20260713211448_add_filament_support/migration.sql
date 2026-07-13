-- CreateTable
CREATE TABLE "Filament" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "material" TEXT NOT NULL DEFAULT 'PLA',
    "manufacturer" TEXT,
    "color" TEXT,
    "purchasePrice" REAL NOT NULL,
    "purchaseUnit" TEXT NOT NULL,
    "purchaseQuantity" REAL NOT NULL,
    "calculatedCostPerGram" REAL NOT NULL,
    "manualCostPerGram" REAL,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Filament_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Printer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'RESIN',
    "model" TEXT,
    "powerWatts" REAL NOT NULL,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Printer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Printer" ("createdAt", "id", "isActive", "model", "name", "notes", "powerWatts", "updatedAt", "userId") SELECT "createdAt", "id", "isActive", "model", "name", "notes", "powerWatts", "updatedAt", "userId" FROM "Printer";
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
    "filamentGrams" REAL NOT NULL DEFAULT 0,
    "printTimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "resinId" INTEGER,
    "resinNameSnapshot" TEXT,
    "resinCostPerMlSnapshot" REAL,
    "filamentId" INTEGER,
    "filamentNameSnapshot" TEXT,
    "filamentCostPerGramSnapshot" REAL,
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
    CONSTRAINT "Quote_filamentId_fkey" FOREIGN KEY ("filamentId") REFERENCES "Filament" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Quote_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "Printer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Quote_finishPresetId_fkey" FOREIGN KEY ("finishPresetId") REFERENCES "FinishPreset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Quote" ("createdAt", "customerName", "depthMm", "description", "driveLink", "energyCost", "finalPrice", "finishCost", "finishCostSnapshot", "finishNameSnapshot", "finishPresetId", "freightCost", "freightNotes", "heightMm", "id", "materialCost", "materialType", "modelName", "notes", "pricingMode", "printTimeMinutes", "printerId", "printerNameSnapshot", "printerPowerWattsSnapshot", "profitPercent", "profitValue", "quantity", "resinCostPerMlSnapshot", "resinId", "resinMl", "resinNameSnapshot", "status", "totalCost", "unitCost", "unitPrice", "updatedAt", "userId", "widthMm") SELECT "createdAt", "customerName", "depthMm", "description", "driveLink", "energyCost", "finalPrice", "finishCost", "finishCostSnapshot", "finishNameSnapshot", "finishPresetId", "freightCost", "freightNotes", "heightMm", "id", "materialCost", "materialType", "modelName", "notes", "pricingMode", "printTimeMinutes", "printerId", "printerNameSnapshot", "printerPowerWattsSnapshot", "profitPercent", "profitValue", "quantity", "resinCostPerMlSnapshot", "resinId", "resinMl", "resinNameSnapshot", "status", "totalCost", "unitCost", "unitPrice", "updatedAt", "userId", "widthMm" FROM "Quote";
DROP TABLE "Quote";
ALTER TABLE "new_Quote" RENAME TO "Quote";
CREATE INDEX "Quote_userId_idx" ON "Quote"("userId");
CREATE INDEX "Quote_status_idx" ON "Quote"("status");
CREATE INDEX "Quote_createdAt_idx" ON "Quote"("createdAt");
CREATE INDEX "Quote_modelName_idx" ON "Quote"("modelName");
CREATE INDEX "Quote_customerName_idx" ON "Quote"("customerName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Filament_userId_name_key" ON "Filament"("userId", "name");
