CREATE TABLE "AppSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "companyName" TEXT,
    "kwhCost" REAL NOT NULL DEFAULT 1.14,
    "defaultProfitPercent" REAL NOT NULL DEFAULT 100,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "Resin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "Printer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "model" TEXT,
    "powerWatts" REAL NOT NULL,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "FinishPreset" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fixedCost" REAL NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "Quote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
    CONSTRAINT "Quote_resinId_fkey" FOREIGN KEY ("resinId") REFERENCES "Resin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Quote_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "Printer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Quote_finishPresetId_fkey" FOREIGN KEY ("finishPresetId") REFERENCES "FinishPreset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Resin_name_key" ON "Resin"("name");
CREATE UNIQUE INDEX "Printer_name_key" ON "Printer"("name");
CREATE UNIQUE INDEX "FinishPreset_name_key" ON "FinishPreset"("name");
CREATE INDEX "Quote_status_idx" ON "Quote"("status");
CREATE INDEX "Quote_createdAt_idx" ON "Quote"("createdAt");
CREATE INDEX "Quote_modelName_idx" ON "Quote"("modelName");
CREATE INDEX "Quote_customerName_idx" ON "Quote"("customerName");
