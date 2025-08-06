import dotenvFlow from 'dotenv-flow';

// 读取根目录的 .env 文件
dotenvFlow.config({ path: '../../' });

/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        NEXT_PUBLIC_BACKEND_BASE_URL: process.env.NEXT_PUBLIC_BACKEND_BASE_URL,
        NEXT_PUBLIC_BACKEND_API_URL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
        NEXT_PUBLIC_SESSION_SECRET_KEY: process.env.NEXT_PUBLIC_SESSION_SECRET_KEY,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    webpack(config, { dev }) {
        config.externals.push({ canvas: 'commonjs canvas' });
        if (config.cache && !dev) {
            config.cache = Object.freeze({ type: 'memory' });
        }
        return config;
    },
};

export default nextConfig;
