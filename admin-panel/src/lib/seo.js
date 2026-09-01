const SITE = 'https://easyservice.tech';

export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Easyservice',
  description:
    'Online home services marketplace — book verified professionals for AC repair, plumbing, electrical, painting and cleaning in Pakistan.',
  url: `${SITE}/`,
  logo: `${SITE}/icons/logo.png`,
  image: `${SITE}/icons/logo.png`,
  priceRange: '$$',
  areaServed: 'Pakistan',
  telephone: '+923001234567',
  address: { '@type': 'PostalAddress', addressCountry: 'PK' },
};

export function serviceSchema(name, desc) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description: desc,
    provider: { '@type': 'LocalBusiness', name: 'Easyservice', url: `${SITE}/` },
    areaServed: 'Pakistan',
  };
}

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE}${it.path}`,
    })),
  };
}

export function faqSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };
}
