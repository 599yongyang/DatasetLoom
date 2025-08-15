export enum ProjectRole {
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
    EDITOR = 'EDITOR',
    VIEWER = 'VIEWER'
}

export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN'
}

export enum ChatVisibilityType {
    PUBLIC = 'PUBLIC',
    PRIVATE = 'PRIVATE'
}

export enum ContextType {
    TEXT = 'TEXT',
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO',
    AUDIO = 'AUDIO'
}

export enum ModelConfigType {
    TEXT = 'TEXT',
    VISION = 'VISION',
    COT = 'COT',
    TOOL = 'TOOL',
    EMBED = 'EMBED'
}

export enum EvalSourceType {
    HUMAN = 'HUMAN',
    AI = 'AI'
}

export enum ParseStatusType {
    PENDING = 'PENDING',
    DONE = 'DONE',
    FAILED = 'FAILED'
}

export enum PromptTemplateType {
    QUESTION = 'QUESTION',
    ANSWER = 'ANSWER',
    OTHER = 'OTHER'
}


