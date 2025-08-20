-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileExt" TEXT,
    "path" TEXT,
    "size" INTEGER,
    "md5" TEXT,
    "sourceType" TEXT NOT NULL DEFAULT 'local',
    "parserFilePath" TEXT,
    "parserFileExt" TEXT,
    "parserFileSize" INTEGER,
    "embedModelName" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Documents_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Documents" ("createdAt", "fileExt", "fileName", "id", "md5", "parserFileExt", "parserFilePath", "parserFileSize", "path", "projectId", "size", "sourceType", "updatedAt") SELECT "createdAt", "fileExt", "fileName", "id", "md5", "parserFileExt", "parserFilePath", "parserFileSize", "path", "projectId", "size", "sourceType", "updatedAt" FROM "Documents";
DROP TABLE "Documents";
ALTER TABLE "new_Documents" RENAME TO "Documents";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
