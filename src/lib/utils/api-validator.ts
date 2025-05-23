import { NextResponse } from 'next/server';
import { getProject } from '@/lib/db/projects';

export type ValidationResult = {
    success: boolean;
    data?: any;
    response?: Response;
};

export async function validateProjectId(projectId: string): Promise<ValidationResult> {
    if (!projectId) {
        return {
            success: false,
            response: NextResponse.json({ error: 'The project ID cannot be empty' }, { status: 400 })
        };
    }

    const project = await getProject(projectId);
    if (!project) {
        return {
            success: false,
            response: NextResponse.json({ error: 'The project does not exist' }, { status: 404 })
        };
    }

    return {
        success: true,
        data: project
    };
}
