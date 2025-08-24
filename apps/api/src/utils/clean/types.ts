export interface CleaningResult {
    original: string;
    cleaned: string;
    changes: CleaningChange[];
    stats: CleaningStats;
}

export interface CleaningChange {
    rule: string;
    before: string;
    after: string;
}

export interface CleaningStats {
    originalLength: number;
    cleanedLength: number;
    changeCount: number;
    processingTime: number;
}
