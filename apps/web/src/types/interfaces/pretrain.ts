export interface PretrainData {
    id: string;
    projectId: string;
    documentId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    document: {
        fileName: string
    };
}
