const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    outputFileTracingRoot: path.resolve(__dirname),
    turbopack: {
        root: path.resolve(__dirname),
    },
};

module.exports = nextConfig;
