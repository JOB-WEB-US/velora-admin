/** @type {import('next').NextConfig} */
const isDevelopment = process.env.NODE_ENV !== "production";
const apiOrigin = (() => { try { return new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").origin; } catch { return "http://localhost:5000"; } })();
const wsOrigin = apiOrigin.replace(/^http/, "ws");
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              `default-src 'self'; script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://res.cloudinary.com blob:; font-src 'self' data:; connect-src 'self' ${apiOrigin} ${wsOrigin}; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';`,
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
