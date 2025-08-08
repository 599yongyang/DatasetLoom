export interface ImageFile {
    id: string;
    projectId: string;
    fileName: string;
    width: number;
    height: number;
    size: number;
    url: string;
    ocrText: string;
    tags: string;
    status: string;
    createdAt: Date;
}

export interface ImageBlock {
    id: string;
    projectId: string;
    imageId: string;
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
    createdAt: Date;
}


export interface ImageBlockWithImage extends ImageBlock {
    image: ImageFile;
}


export interface ImageWithImageBlock extends ImageFile {
    ImageBlock: ImageBlock[];
}
