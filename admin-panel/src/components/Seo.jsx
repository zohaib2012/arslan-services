import { useEffect } from 'react';

const SITE_URL = 'https://easyservice.tech';
const DEFAULT_TITLE = 'Easyservice — Home Services Made Easy';
const DEFAULT_DESC =
  'Book verified home services professionals in Pakistan — AC repair, plumber, electrician, painter, cleaning and more. Instant booking, trusted pros, 24/7.';

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, href) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function upsertJsonLd(id, data) {
  document.getElementById(id)?.remove();
  if (!data) return;
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = id;
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

export default function Seo({
  title,
  description,
  canonicalPath,
  image = '/icons/logo.png',
  type = 'website',
  jsonLd = [],
  noindex = false,
}) {
  useEffect(() => {
    const t = title ? `${title} | Easyservice` : DEFAULT_TITLE;
    document.title = t;

    if (noindex) {
      upsertMeta('name', 'robots', 'noindex, nofollow');
    } else {
      const existing = document.head.querySelector('meta[name="robots"]');
      if (existing && existing.getAttribute('content')?.includes('noindex')) {
        existing.remove();
      }
    }

    upsertMeta('name', 'description', description || DEFAULT_DESC);
    upsertMeta('property', 'og:title', t);
    upsertMeta('property', 'og:description', description || DEFAULT_DESC);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', `${SITE_URL}${canonicalPath || ''}`);
    upsertMeta('property', 'og:image', `${SITE_URL}${image}`);
    upsertMeta('property', 'og:site_name', 'Easyservice');
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', t);
    upsertMeta('name', 'twitter:description', description || DEFAULT_DESC);
    upsertMeta('name', 'twitter:image', `${SITE_URL}${image}`);

    upsertLink('canonical', `${SITE_URL}${canonicalPath || '/'}`);

    const schemas = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
    upsertJsonLd('page-jsonld', schemas.length ? schemas : null);
  }, [title, description, canonicalPath, image, type, jsonLd, noindex]);

  return null;
}

export { SITE_URL, DEFAULT_TITLE, DEFAULT_DESC };
