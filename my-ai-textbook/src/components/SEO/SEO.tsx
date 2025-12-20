import React from 'react';
import Head from '@docusaurus/Head';
import { useLocation } from '@docusaurus/router';

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  article?: boolean;
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  type?: 'website' | 'article' | 'profile';
  lang?: string;
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

/**
 * SEO component for meta tags and open graph
 * Optimizes pages for search engines and social sharing
 */
export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  image,
  article = false,
  keywords = [],
  author,
  publishedTime,
  modifiedTime,
  type = 'website',
  lang = 'en',
  canonical,
  noindex = false,
  nofollow = false,
}) => {
  const location = useLocation();

  // Default values
  const siteTitle = 'Physical AI & Humanoid Robotics';
  const siteDescription =
    'A comprehensive learning resource for Physical AI, Robotics, and Humanoid Systems';
  const siteUrl = 'https://physical-ai-humanoid-robotic-six.vercel.app';
  const defaultImage = `${siteUrl}/img/og-image.jpg`;

  // Construct full values
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const fullDescription = description || siteDescription;
  const fullImage = image || defaultImage;
  const fullUrl = canonical || `${siteUrl}${location.pathname}`;

  // Robots meta
  const robotsContent = [];
  if (noindex) robotsContent.push('noindex');
  if (nofollow) robotsContent.push('nofollow');
  const robots = robotsContent.length > 0 ? robotsContent.join(', ') : 'index, follow';

  return (
    <Head>
      {/* Basic meta tags */}
      <html lang={lang} />
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      {author && <meta name="author" content={author} />}
      <meta name="robots" content={robots} />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={article ? 'article' : type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content={lang.replace('-', '_')} />

      {/* Article specific */}
      {article && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {article && modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {article && author && <meta property="article:author" content={author} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />

      {/* Additional meta tags for better SEO */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
    </Head>
  );
};

export default SEO;
