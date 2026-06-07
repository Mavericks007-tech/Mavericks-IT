/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'maverickstech.com.bd'],
    formats: ['image/avif', 'image/webp'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  output: 'standalone',
}

module.exports = nextConfig
