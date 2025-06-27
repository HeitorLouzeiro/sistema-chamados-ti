import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // Reabilitado após corrigir o problema de hooks
  // Configurações para lidar com problemas de hidratação
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

export default nextConfig;
