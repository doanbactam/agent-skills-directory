import type { NextConfig } from "next"
import type { RemotePattern } from "next/dist/shared/lib/image-config"

import { IMAGE_HOSTNAMES, IMAGE_HOSTNAME_SUFFIXES } from "./config/image-hosts"
import "./lib/env"

const isProd = process.env.NODE_ENV === "production"

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  ...(isProd
    ? [
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
    ]
    : []),
]

const nextConfig: NextConfig = {
  compress: true, // Enable gzip/brotli compression to reduce egress
  poweredByHeader: false,
  // serverExternalPackages: ["@clerk/nextjs"], // Removed to allow bundling
  turbopack: {
    root: __dirname,
  },

  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: (() => {
      const securePatterns: RemotePattern[] = IMAGE_HOSTNAMES.map((hostname) => ({
        protocol: "https",
        hostname,
      }))
      const suffixPatterns: RemotePattern[] = IMAGE_HOSTNAME_SUFFIXES.map((suffix) => ({
        protocol: "https",
        hostname: `*${suffix}`,
      }))
      return [...securePatterns, ...suffixPatterns]
    })(),
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ]
  },
}

export default nextConfig
