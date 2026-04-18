import { useEffect } from 'react';

/**
 * Custom hook for managing SEO meta tags
 * @param {Object} options - SEO options
 * @param {string} options.title - Page title
 * @param {string} options.description - Meta description
 * @param {string} options.keywords - Meta keywords (comma-separated)
 * @param {string} options.canonicalUrl - Canonical URL
 * @param {Object} options.openGraph - Open Graph tags
 * @param {Object} options.structuredData - JSON-LD structured data
 */
export function useSEO({
  title,
  description,
  keywords,
  canonicalUrl,
  openGraph = {},
  structuredData,
}) {
  useEffect(() => {
    // Set document title
    if (title) {
      document.title = title;
    }

    // Helper to set or create meta tag
    const setMetaTag = (name, content, property = false) => {
      if (!content) return;
      const attr = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    setMetaTag('description', description);
    setMetaTag('keywords', keywords);

    // Open Graph tags
    setMetaTag('og:title', openGraph.title || title, true);
    setMetaTag('og:description', openGraph.description || description, true);
    setMetaTag('og:type', openGraph.type || 'website', true);
    setMetaTag('og:url', openGraph.url || canonicalUrl, true);
    if (openGraph.image) {
      setMetaTag('og:image', openGraph.image, true);
    }

    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', openGraph.title || title);
    setMetaTag('twitter:description', openGraph.description || description);
    if (openGraph.image) {
      setMetaTag('twitter:image', openGraph.image);
    }

    // Canonical URL
    if (canonicalUrl) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonicalUrl);
    }

    // Structured Data (JSON-LD)
    if (structuredData) {
      let script = document.querySelector('script[data-seo="structured-data"]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.setAttribute('data-seo', 'structured-data');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }

    // Cleanup function
    return () => {
      // Reset title on unmount (optional - you may want to keep it)
      // document.title = 'That Software House';
    };
  }, [title, description, keywords, canonicalUrl, openGraph, structuredData]);
}

export default useSEO;
