/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  experimental : {
    serverActions : {
      bodySizeLimit : '10mb'
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: `${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com`,
        port: '',
        pathname: '/**', // Allow all paths from this bucket
      },
      {
        protocol: 'https',
        hostname: `${process.env.AWS_S3_BUCKET_NAME_PREV}.s3.${process.env.AWS_S3_REGION_PREV}.amazonaws.com`,
        port: '',
        pathname: '/**', // Allow all paths from the second bucket
      },
      {
        protocol: 'https',
        hostname: `www.awajahi.com`,
        port: '',
        pathname: '/**', // Allow all paths from the second bucket
      },
      {
        protocol: 'https',
        hostname: `img.icons8.com`,
        port: '',
        pathname: '/**', // Allow all paths from this bucket
      },
    ],
  },
};

export default nextConfig;
 
// 