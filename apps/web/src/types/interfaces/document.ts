export interface DocumentChunkCount {
    Chunks: number;
}

export interface DocumentsWithCount {
    id: string;
    projectId: string;
    fileName: string;
    fileExt: string;
    path: string;
    size: number;
    md5: string;
    sourceType: string;
    parserFilePath: string;
    parserFileExt: string;
    parserFileSize: number;
    createdAt: Date;
    updatedAt: Date;
    _count: DocumentChunkCount;
}


export interface Chunks {
    id: string;
    name: string;
    projectId: string;
    documentId: string;
    documentName: string;
    content: string;
    summary: string;
    domain: string;
    subDomain: string;
    tags: string;
    language: string;
    size: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ChunkEntities {
    id: string;
    chunkId: string;
    type: string;
    value: string;
    normalizedValue: string | null;
    outgoingRelations?: ChunkRelation[];
    incomingRelations?: ChunkRelation[];
}

export interface ChunkRelation {
    id: string;
    relationType: string;
    sourceEntityId: string;
    targetEntityId: string;

    sourceEntity?: ChunkEntities;
    targetEntity?: ChunkEntities;
}
