/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/home/institucion/:path*',
        destination: '/institucion/:path*',
        permanent: false,
      },
      {
        source: '/home/institucion',
        destination: '/institucion',
        permanent: false,
      },
      {
        source: '/home/:path*',
        destination: '/ciudadano/:path*',
        permanent: false,
      },
      {
        source: '/home',
        destination: '/ciudadano',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
