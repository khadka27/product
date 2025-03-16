import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["productrename.vercel.app", "localhost"], // Allow images from localhost
  },
};

export default nextConfig;
