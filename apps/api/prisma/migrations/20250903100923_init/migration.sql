-- CreateTable
CREATE TABLE "public"."Users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "globalPrompt" TEXT NOT NULL DEFAULT '',
    "questionPrompt" TEXT NOT NULL DEFAULT '',
    "answerPrompt" TEXT NOT NULL DEFAULT '',
    "labelPrompt" TEXT NOT NULL DEFAULT '',
    "domainTreePrompt" TEXT NOT NULL DEFAULT '',
    "embedModelId" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectMember" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Documents" (
    "id" TEXT NOT NULL,
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
    "scope" TEXT NOT NULL DEFAULT 'QA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Chunks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "documentName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "domain" TEXT NOT NULL DEFAULT '',
    "subDomain" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '',
    "language" TEXT NOT NULL DEFAULT '',
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChunkEntities" (
    "id" TEXT NOT NULL,
    "chunkId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "normalizedValue" TEXT,

    CONSTRAINT "ChunkEntities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChunkRelation" (
    "id" TEXT NOT NULL,
    "relationType" TEXT NOT NULL,
    "sourceEntityId" TEXT NOT NULL,
    "targetEntityId" TEXT NOT NULL,

    CONSTRAINT "ChunkRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Questions" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "contextType" TEXT NOT NULL,
    "contextId" TEXT NOT NULL,
    "contextName" TEXT NOT NULL,
    "contextData" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "realQuestion" TEXT NOT NULL DEFAULT '',
    "label" TEXT NOT NULL DEFAULT '',
    "answered" BOOLEAN NOT NULL DEFAULT false,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DatasetSamples" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "referenceLabel" TEXT NOT NULL,
    "evidence" TEXT NOT NULL,
    "cot" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "isPrimaryAnswer" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DatasetSamples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DatasetEvaluation" (
    "id" TEXT NOT NULL,
    "sampleId" TEXT NOT NULL,
    "sampleType" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "factualAccuracyScore" DOUBLE PRECISION NOT NULL,
    "factualInfo" TEXT NOT NULL,
    "logicalIntegrityScore" DOUBLE PRECISION NOT NULL,
    "logicalInfo" TEXT NOT NULL,
    "expressionQualityScore" DOUBLE PRECISION NOT NULL,
    "expressionInfo" TEXT NOT NULL,
    "safetyComplianceScore" DOUBLE PRECISION NOT NULL,
    "safetyInfo" TEXT NOT NULL,
    "compositeScore" DOUBLE PRECISION NOT NULL,
    "compositeInfo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DatasetEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PreferencePair" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "chosen" TEXT NOT NULL,
    "rejected" TEXT NOT NULL,
    "datasetChosenId" TEXT,
    "datasetRejectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreferencePair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ModelProviders" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "apiUrl" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "interfaceType" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModelProviders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ModelRegistry" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModelRegistry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ModelConfig" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "maxTokens" INTEGER NOT NULL,
    "topP" DOUBLE PRECISION,
    "topK" DOUBLE PRECISION,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ModelConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ParserConfig" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "apiUrl" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParserConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Chat" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'PRIVATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChatMessages" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "parts" TEXT NOT NULL,
    "attachments" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatMessages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChatMessageVote" (
    "chatId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "isUpvote" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "public"."ModelUsage" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "modelConfigId" TEXT NOT NULL,
    "promptTokens" INTEGER NOT NULL,
    "completionTokens" INTEGER NOT NULL,
    "totalTokens" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModelUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ImageFile" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "ocrText" TEXT,
    "tags" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImageFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ImageBlock" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImageBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PromptTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "content" TEXT,
    "variables" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "PromptTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PretrainData" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PretrainData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "public"."Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_projectId_userId_key" ON "public"."ProjectMember"("projectId", "userId");

-- CreateIndex
CREATE INDEX "Chunks_projectId_idx" ON "public"."Chunks"("projectId");

-- CreateIndex
CREATE INDEX "ChunkEntities_chunkId_idx" ON "public"."ChunkEntities"("chunkId");

-- CreateIndex
CREATE INDEX "ChunkEntities_type_idx" ON "public"."ChunkEntities"("type");

-- CreateIndex
CREATE INDEX "ChunkEntities_normalizedValue_idx" ON "public"."ChunkEntities"("normalizedValue");

-- CreateIndex
CREATE UNIQUE INDEX "ChunkEntities_chunkId_type_normalizedValue_key" ON "public"."ChunkEntities"("chunkId", "type", "normalizedValue");

-- CreateIndex
CREATE INDEX "ChunkRelation_sourceEntityId_idx" ON "public"."ChunkRelation"("sourceEntityId");

-- CreateIndex
CREATE INDEX "ChunkRelation_targetEntityId_idx" ON "public"."ChunkRelation"("targetEntityId");

-- CreateIndex
CREATE INDEX "ChunkRelation_relationType_idx" ON "public"."ChunkRelation"("relationType");

-- CreateIndex
CREATE UNIQUE INDEX "ChunkRelation_sourceEntityId_targetEntityId_relationType_key" ON "public"."ChunkRelation"("sourceEntityId", "targetEntityId", "relationType");

-- CreateIndex
CREATE INDEX "Questions_projectId_idx" ON "public"."Questions"("projectId");

-- CreateIndex
CREATE INDEX "DatasetSamples_projectId_idx" ON "public"."DatasetSamples"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "PreferencePair_questionId_key" ON "public"."PreferencePair"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatMessageVote_chatId_messageId_key" ON "public"."ChatMessageVote"("chatId", "messageId");

-- CreateIndex
CREATE INDEX "ModelUsage_createdAt_idx" ON "public"."ModelUsage"("createdAt");

-- CreateIndex
CREATE INDEX "ModelUsage_modelConfigId_idx" ON "public"."ModelUsage"("modelConfigId");

-- AddForeignKey
ALTER TABLE "public"."Projects" ADD CONSTRAINT "Projects_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Documents" ADD CONSTRAINT "Documents_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Chunks" ADD CONSTRAINT "Chunks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Chunks" ADD CONSTRAINT "Chunks_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."Documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChunkEntities" ADD CONSTRAINT "ChunkEntities_chunkId_fkey" FOREIGN KEY ("chunkId") REFERENCES "public"."Chunks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChunkRelation" ADD CONSTRAINT "ChunkRelation_sourceEntityId_fkey" FOREIGN KEY ("sourceEntityId") REFERENCES "public"."ChunkEntities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChunkRelation" ADD CONSTRAINT "ChunkRelation_targetEntityId_fkey" FOREIGN KEY ("targetEntityId") REFERENCES "public"."ChunkEntities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Questions" ADD CONSTRAINT "Questions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DatasetSamples" ADD CONSTRAINT "DatasetSamples_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DatasetSamples" ADD CONSTRAINT "DatasetSamples_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PreferencePair" ADD CONSTRAINT "PreferencePair_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PreferencePair" ADD CONSTRAINT "PreferencePair_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ModelProviders" ADD CONSTRAINT "ModelProviders_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ModelConfig" ADD CONSTRAINT "ModelConfig_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "public"."ModelProviders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ModelConfig" ADD CONSTRAINT "ModelConfig_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ParserConfig" ADD CONSTRAINT "ParserConfig_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Chat" ADD CONSTRAINT "Chat_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Chat" ADD CONSTRAINT "Chat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatMessages" ADD CONSTRAINT "ChatMessages_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatMessageVote" ADD CONSTRAINT "ChatMessageVote_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatMessageVote" ADD CONSTRAINT "ChatMessageVote_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "public"."ChatMessages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ModelUsage" ADD CONSTRAINT "ModelUsage_modelConfigId_fkey" FOREIGN KEY ("modelConfigId") REFERENCES "public"."ModelConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImageFile" ADD CONSTRAINT "ImageFile_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImageBlock" ADD CONSTRAINT "ImageBlock_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImageBlock" ADD CONSTRAINT "ImageBlock_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "public"."ImageFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromptTemplate" ADD CONSTRAINT "PromptTemplate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PretrainData" ADD CONSTRAINT "PretrainData_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PretrainData" ADD CONSTRAINT "PretrainData_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."Documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
