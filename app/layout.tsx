import * as React from "react"
import { ClerkProvider } from "@clerk/nextjs"
import { Geist, Geist_Mono, Inter } from "next/font/google"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import "./globals.css"

import { AnalyticsWrapper } from "@/components/analytics/analytics-wrapper"
import { Footer } from "@/components/layouts/footer"
import { Header } from "@/components/layouts/header"
import { CookieBanner } from "@/features/marketing/cookie-banner"
import { SiteStructuredData } from "@/components/seo/site-structured-data"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

import { baseMetadata } from "@/lib/seo"
import { siteConfig } from "@/config/site"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
})

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: false,
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
})

export const metadata = {
  ...baseMetadata,
  verification: {
    yandex: "0df0fccb3af06536",
    other: {
      "msvalidate.01": "",
    },
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}

type RootLayoutProps = Readonly<{
  children: React.ReactNode
}>

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${geistSans.variable} ${geistMono.variable}`} dir="ltr">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://clerk.agnxi.com" />
          <link rel="dns-prefetch" href="https://github.com" />
          <link rel="dns-prefetch" href="https://raw.githubusercontent.com" />
          <link rel="dns-prefetch" href="https://avatars.githubusercontent.com" />
          <link rel="manifest" href="/manifest.json" />
          <link rel="alternate" type="application/rss+xml" title="AGNXI RSS Feed" href="/feed.xml" />
          <link rel="alternate" type="application/atom+xml" title="AGNXI Atom Feed" href="/atom.xml" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content={siteConfig.name} />
          <meta name="mobile-web-app-capable" content="yes" />
          {/* Analytics script loaded lazily via LazyAnalytics component */}
        </head>
        <body
          className="antialiased bg-background text-foreground flex min-h-screen flex-col"
        >
          <NuqsAdapter>
            <TooltipProvider delay={350} closeDelay={100}>
              <SiteStructuredData />
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow-md focus:ring-2 focus:ring-primary"
              >
                Skip to main content
              </a>
              <Header />
              <main id="main-content" className="flex-1" role="main">
                {children}
              </main>
              <Footer />
              <CookieBanner />
              <Toaster />
              <AnalyticsWrapper />
            </TooltipProvider>
          </NuqsAdapter>
        </body>
      </html>
    </ClerkProvider>
  )
}
