/*
  Warnings:

  - You are about to drop the column `flowId` on the `Connection` table. All the data in the column will be lost.
  - Added the required column `dollarAmount` to the `Connection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inputFlowId` to the `Connection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `percentAmount` to the `Connection` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Connection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dollarAmount" DECIMAL NOT NULL,
    "percentAmount" DECIMAL NOT NULL,
    "inputFlowId" INTEGER NOT NULL,
    "outputFlowId" INTEGER,
    CONSTRAINT "Connection_inputFlowId_fkey" FOREIGN KEY ("inputFlowId") REFERENCES "Flow" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Connection_outputFlowId_fkey" FOREIGN KEY ("outputFlowId") REFERENCES "Flow" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Connection" ("id") SELECT "id" FROM "Connection";
DROP TABLE "Connection";
ALTER TABLE "new_Connection" RENAME TO "Connection";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
