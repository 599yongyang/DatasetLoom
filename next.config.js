/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import './src/env.js';

/** @type {import('next').NextConfig} */
const config = {
    // compress: true,
    eslint: {
        ignoreDuringBuilds: true
    },
    webpack(config, { dev }) {
        config.externals.push({
            canvas: 'commonjs canvas'
        });
        if (config.cache && !dev) {
            config.cache = Object.freeze({
                type: 'memory'
            });
        }
        return config;
    }
};

export default config;
