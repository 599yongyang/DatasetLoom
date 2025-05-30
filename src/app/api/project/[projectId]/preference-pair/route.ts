import { NextResponse } from 'next/server';
import { validateProjectId } from '@/lib/utils/api-validator';
import {
    checkPreferencePair,
    getPreferencePair,
    insertPreferencePair,
    updatePreferencePair
} from '@/lib/db/preference-pair';

type Params = Promise<{ projectId: string }>;

export async function GET(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { projectId } = params;
        const url = new URL(request.url);
        const searchParams = url.searchParams;
        const validationResult = await validateProjectId(projectId);
        if (!validationResult.success) {
            return validationResult.response;
        }
        const questionId = searchParams.get('questionId');
        if (!questionId) {
            return NextResponse.json({ error: 'The question ID cannot be empty' }, { status: 400 });
        }
        const data = await getPreferencePair(projectId, questionId);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error get PreferencePair:', error);
        return NextResponse.json({ error: 'Failed to get PreferencePair' }, { status: 500 });
    }
}

export async function POST(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { projectId } = params;
        const validationResult = await validateProjectId(projectId);
        if (!validationResult.success) {
            return validationResult.response;
        }
        const pp = await request.json();

        const check = await checkPreferencePair(projectId, pp.questionId);
        if (check) {
            await updatePreferencePair(pp);
        } else {
            await insertPreferencePair(pp);
        }
        return NextResponse.json({ message: 'success' });
    } catch (error) {
        console.error('Error save PreferencePair:', error);
        return NextResponse.json({ error: 'Failed to save PreferencePair' }, { status: 500 });
    }
}
