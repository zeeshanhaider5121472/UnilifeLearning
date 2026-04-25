/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/:path*',
        // destination: 'https://json-db-api-production.up.railway.app/:path*',
      },
    ];
  },
};

export default nextConfig;