import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false, // 启用 PWA(包括开发模式)
})(nextConfig);
