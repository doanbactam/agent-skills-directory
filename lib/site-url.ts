function normalizeUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url
}

function isLocalhost(url: string) {
  return /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?$/i.test(url)
}

export function getSiteUrl() {
  const publicUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (publicUrl && !isLocalhost(publicUrl)) {
    return normalizeUrl(publicUrl)
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  if (publicUrl) {
    return normalizeUrl(publicUrl)
  }

  return "https://agnxi.com"
}
