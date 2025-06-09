'use server';

import { db } from '@/server/db';
import type { ParserConfig } from '@prisma/client';

export async function createParserConfig(parserConfig: ParserConfig) {
    console.log('createParserConfig', parserConfig);
    try {
        return await db.parserConfig.create({ data: parserConfig });
    } catch (error) {
        console.error('Failed to create parserConfig in database');
        throw error;
    }
}

export async function updateParserConfig(parserConfig: ParserConfig) {
    try {
        return await db.parserConfig.update({ where: { id: parserConfig.id }, data: parserConfig });
    } catch (error) {
        console.error('Failed to update parserConfig in database');
        throw error;
    }
}

export async function getParserConfigList(projectId: string) {
    try {
        return await db.parserConfig.findMany({ where: { projectId } });
    } catch (error) {
        console.error('Failed to get parserConfig list in database');
        throw error;
    }
}

export async function checkParserConfig(projectId: string, serviceId: string) {
    try {
        return await db.parserConfig.findFirst({ where: { projectId, serviceId } });
    } catch (error) {
        console.error('Failed to check parserConfig by name in database');
        throw error;
    }
}

export async function getParserConfig(projectId: string, serviceId: string) {
    try {
        return await db.parserConfig.findFirst({ where: { projectId, serviceId } });
    } catch (error) {
        console.error('Failed to get parserConfig by name in database');
        throw error;
    }
}
