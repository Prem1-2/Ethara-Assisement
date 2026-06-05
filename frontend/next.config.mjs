/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone",

  // Hosts (besides localhost) allowed to request Next.js dev resources
  // (e.g. /_next/webpack-hmr) when you open the dev server over the LAN.
  allowedDevOrigins: ["192.168.137.1"],
};

export default nextConfig;
