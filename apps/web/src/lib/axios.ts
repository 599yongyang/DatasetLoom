import axios, {
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosResponse,
    type InternalAxiosRequestConfig,
    type CancelTokenSource
} from 'axios';
import {getSession} from './session';

class ApiClient {
    private axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
            timeout: 30000,
        });
        // 请求拦截器 - 添加 token
        this.axiosInstance.interceptors.request.use(
            async (config: InternalAxiosRequestConfig) => {
                try {
                    const session = await getSession();
                    if (session?.accessToken) {
                        config.headers.Authorization = `Bearer ${session.accessToken}`;
                    }
                    return config;
                } catch (error) {
                    return Promise.reject(error);
                }
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // 响应拦截器
        this.axiosInstance.interceptors.response.use(
            (response: AxiosResponse) => {
                return response;
            },
            (error) => {
                if (error.response?.status === 401) {
                    console.log(error.response);
                    console.warn('Unauthorized access - redirect to login');
                }
                return Promise.reject(error.response.data);
            }
        );
    }

    // 创建取消令牌
    createCancelToken(): CancelTokenSource {
        return axios.CancelToken.source();
    }

    // 通用请求方法
    request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.request<T>(config);
    }

    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.get<T>(url, config);
    }

    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.post<T>(url, data, config);
    }

    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.put<T>(url, data, config);
    }

    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.delete<T>(url, config);
    }

    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.patch<T>(url, data, config);
    }
}

const apiClient = new ApiClient();
export default apiClient;
