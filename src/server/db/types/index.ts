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

export enum QuestionContextType {
    TEXT = 'TEXT',
    IMAGE = 'IMAGE'
}

export enum ModelConfigType {
    TEXT = 'TEXT',
    VISION = 'VISION',
    COT = 'COT',
    TOOL = 'TOOL',
    EMBED = 'EMBED'
}
