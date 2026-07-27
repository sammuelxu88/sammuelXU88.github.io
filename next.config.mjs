const isStaticExport = process.env.STATIC_EXPORT === "true";

const nextConfig = {
  output: isStaticExport ? "export" : undefined,
  trailingSlash: isStaticExport,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    unoptimized: true
  }
};

export default nextConfig;
