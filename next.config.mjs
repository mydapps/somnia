/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.externals.push(
            'pino-pretty',
            'tap',
            'tape',
            'why-is-node-running'
        );
        return config;
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    compress: false,
};

export default nextConfig;
