import type { NextConfig } from 'next';

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const githubBasePath = process.env.GITHUB_ACTIONS === 'true' && repositoryName
  ? `/${repositoryName}`
  : undefined;

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  assetPrefix: githubBasePath,
};

export default nextConfig;
