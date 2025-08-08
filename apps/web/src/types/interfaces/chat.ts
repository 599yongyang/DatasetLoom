export interface ChatMessages {
    id: string;
    chatId: string;
    role: string;
    parts: string;
    attachments: string;
    createdAt: Date;
    updatedAt: Date;
}


export interface Chat {
    id: string;
    projectId: string;
    title: string;
    userId: string;
    visibility: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ChatMessageVote {
    chatId: string;
    messageId: string;
    isUpvote: boolean;
}
