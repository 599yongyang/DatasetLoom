import { NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';

// 统一模型响应接口
interface ModelItem {
    modelId: string;
    modelName: string;
    providerName: string;
}

// 请求体接口
interface RequestBody {
    apiUrl: string;
    providerName: string;
    apiKey?: string;
    interfaceType: string;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // 类型校验
        const { apiUrl, providerName, interfaceType, apiKey } = body as RequestBody;

        if (!apiUrl || !interfaceType) {
            return NextResponse.json({ error: 'Missing required fields: endpoint, providerId' }, { status: 400 });
        }

        let url = apiUrl.replace(/\/$/, '');

        // 构建 URL 路径
        url += interfaceType === 'ollama' ? '/tags' : '/models';

        let data: ModelItem[] = [];

        // 获取模型数据
        const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};

        const res = await axios.get(url, { headers });

        if (interfaceType === 'ollama') {
            data = res.data.models.map((item: any) => ({
                modelId: item.model,
                modelName: item.name,
                providerName
            }));
        } else {
            data =
                res.data.data?.map((item: any) => ({
                    modelId: item.id,
                    modelName: item.id,
                    providerName
                })) || [];
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('获取模型失败:', error);

        const axiosError = error as AxiosError;

        let errorMessage = '获取模型失败，请检查配置';
        let statusCode = 500;

        if (axiosError.response) {
            // 服务器返回了错误状态码
            const { status, data } = axiosError.response;
            errorMessage = `Provider 返回错误：${status} - ${(data as any).message || JSON.stringify(data)}`;
            statusCode = status;
        } else if (axiosError.request) {
            // 请求已发送但未收到响应
            errorMessage = '无响应，请确认服务是否可用';
        } else if (axiosError.isAxiosError) {
            // 网络错误或其他 Axios 错误
            errorMessage = axiosError.message;
        }

        return NextResponse.json({ error: errorMessage }, { status: statusCode });
    }
}
