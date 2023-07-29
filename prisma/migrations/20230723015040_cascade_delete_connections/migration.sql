-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Connection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dollarAmount" DECIMAL NOT NULL,
    "percentAmount" DECIMAL NOT NULL,
    "inputFlowId" INTEGER,
    "outputFlowId" INTEGER,
    CONSTRAINT "Connection_inputFlowId_fkey" FOREIGN KEY ("inputFlowId") REFERENCES "Flow" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Connection_outputFlowId_fkey" FOREIGN KEY ("outputFlowId") REFERENCES "Flow" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Connection" ("dollarAmount", "id", "inputFlowId", "outputFlowId", "percentAmount") SELECT "dollarAmount", "id", "inputFlowId", "outputFlowId", "percentAmount" FROM "Connection";
DROP TABLE "Connection";
ALTER TABLE "new_Connection" RENAME TO "Connection";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
