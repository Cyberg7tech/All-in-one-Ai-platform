'use client';

import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  siteName?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  noIndex?: boolean;
  canonicalUrl?: string;
  structuredData?: object;
}

export function SEO({
  title = 'One AI - Complete AI Platform for Business',
  description = 'Transform your workflow with 18+ AI tools, intelligent agents, advanced analytics, and seamless access to multiple AI models. Built for developers, designed for everyone.',
  keywords = 'AI platform, artificial intelligence, AI tools, machine learning, automation, business AI, AI agents, ChatGPT, Claude, AI development',
  image = '/og-image.png',
  url = 'https://one-ai.sgbizsolution.com',
  type = 'website',
  siteName = 'One AI',
  twitterCard = 'summary_large_image',
  noIndex = false,
  canonicalUrl,
  structuredData
}: SEOProps) {
  const fullTitle = title.includes('One AI') ? title : `${title} | One AI`;
  const fullImageUrl = image.startsWith('http') ? image : `${url}${image}`;
  const fullUrl = canonicalUrl || url;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      
      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#3B82F6" />
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      )}
    </Head>
  );
}

// Pre-defined SEO configs for common pages
export const seoConfigs = {
  home: {
    title: 'One AI - Complete AI Platform for Business',
    description: 'Transform your workflow with 18+ AI tools, intelligent agents, advanced analytics, and seamless access to multiple AI models.',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "One AI",
      "description": "Complete AI Platform for Business",
      "url": "https://one-ai.sgbizsolution.com",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
  },
  
  pricing: {
    title: 'Pricing - One AI Platform',
    description: 'Simple, transparent pricing for One AI platform. Start free, upgrade as you grow. Choose the perfect plan for your business needs.',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "One AI Platform",
      "offers": [
        {
          "@type": "Offer",
          "name": "Starter",
          "price": "0",
          "priceCurrency": "USD",
          "billingIncrement": "Monthly"
        },
        {
          "@type": "Offer", 
          "name": "Professional",
          "price": "29",
          "priceCurrency": "USD",
          "billingIncrement": "Monthly"
        },
        {
          "@type": "Offer",
          "name": "Enterprise", 
          "price": "99",
          "priceCurrency": "USD",
          "billingIncrement": "Monthly"
        }
      ]
    }
  },
  
  dashboard: {
    title: 'Dashboard - One AI Platform',
    description: 'Access your AI tools, manage agents, view analytics and control your One AI platform from the central dashboard.',
    noIndex: true
  },
  
  blog: {
    title: 'Blog - One AI Platform',
    description: 'Learn about AI, automation, and business transformation with insights, tutorials, and updates from the One AI team.',
    type: 'website' as const
  }
};

// Hook for dynamic SEO
export function useSEO(config: SEOProps) {
  return <SEO {...config} />;
}
