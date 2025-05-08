import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // 在开发过程中忽略ESLint错误（不推荐生产环境使用）
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
