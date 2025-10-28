import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogUrl?: string
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  twitterSite?: string
  twitterCreator?: string
}

export function SEO({
  title = 'My App',
  description = 'Welcome to my application',
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  twitterCard = 'summary_large_image',
  twitterSite,
  twitterCreator,
}: SEOProps) {
  const fullTitle = title
  const ogTitleFinal = ogTitle || title
  const ogDescriptionFinal = ogDescription || description
  const ogUrlFinal = ogUrl || typeof window !== 'undefined' ? window.location.href : ''

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={ogTitleFinal} />
      <meta property="og:description" content={ogDescriptionFinal} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogUrlFinal && <meta property="og:url" content={ogUrlFinal} />}

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={ogTitleFinal} />
      <meta name="twitter:description" content={ogDescriptionFinal} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      {twitterSite && <meta name="twitter:site" content={twitterSite} />}
      {twitterCreator && <meta name="twitter:creator" content={twitterCreator} />}
    </Helmet>
  )
}
