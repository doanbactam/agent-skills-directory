import * as React from "react"
import DOMPurify from 'dompurify';

function sanitizeHtml(html: string | null | undefined) {
  return html
    ? DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['span', 'p'],
        ALLOWED_ATTR: ['class'],
      })
    : '';
}

type JsonLdProps = Readonly<{
  data: Record<string, unknown>
}>

function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: sanitizeHtml(JSON.stringify(data)),
      }}
    />
  )
}

export { JsonLd }
