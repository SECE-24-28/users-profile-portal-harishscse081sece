/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow images from any https source (for profile picture URLs).
    // The correct wildcard syntax uses `hostname` with a pattern string.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
