export interface ModelProviders {
    id: string;
    projectId: string;
    name: string;
    apiUrl: string;
    apiKey: string;
    interfaceType: string;
    icon: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ModelRegistry {
    id: string;
    modelId: string;
    modelName: string;
    providerName: string;
    createdAt: Date;
    updatedAt: Date;
}
