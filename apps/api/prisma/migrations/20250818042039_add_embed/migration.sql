-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "globalPrompt" TEXT NOT NULL DEFAULT '',
    "questionPrompt" TEXT NOT NULL DEFAULT '',
    "answerPrompt" TEXT NOT NULL DEFAULT '',
    "labelPrompt" TEXT NOT NULL DEFAULT '',
    "domainTreePrompt" TEXT NOT NULL DEFAULT '',
    "embedModelId" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Projects_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Projects" ("answerPrompt", "createdAt", "description", "domainTreePrompt", "globalPrompt", "id", "labelPrompt", "name", "ownerId", "questionPrompt", "updatedAt") SELECT "answerPrompt", "createdAt", "description", "domainTreePrompt", "globalPrompt", "id", "labelPrompt", "name", "ownerId", "questionPrompt", "updatedAt" FROM "Projects";
DROP TABLE "Projects";
ALTER TABLE "new_Projects" RENAME TO "Projects";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
