/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Genera un build standalone que no necesita node_modules (~80MB vs ~300MB)
  output: 'standalone',
};

export default nextConfig;
