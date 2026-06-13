/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emit a self-contained server bundle (.next/standalone) for small Docker images.
  output: "standalone",
};

export default nextConfig;
