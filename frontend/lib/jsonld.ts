// JSON-LD Schema generators for SEO

export interface SchoolInfo {
  name: string;
  description: string;
  url: string;
  logo: string;
  image: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  telephone: string;
  email: string;
  foundingDate?: string;
  sameAs?: string[];
}

export function generateOrganizationSchema(school: SchoolInfo) {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': `${school.url}/#organization`,
    name: school.name,
    alternateName: 'SLNSVM',
    description: school.description,
    url: school.url,
    logo: {
      '@type': 'ImageObject',
      url: school.logo,
      width: 200,
      height: 200,
    },
    image: school.image,
    address: {
      '@type': 'PostalAddress',
      streetAddress: school.address.streetAddress,
      addressLocality: school.address.addressLocality,
      addressRegion: school.address.addressRegion,
      postalCode: school.address.postalCode,
      addressCountry: school.address.addressCountry,
    },
    telephone: school.telephone,
    email: school.email,
    foundingDate: school.foundingDate,
    sameAs: school.sameAs || [],
    // School-specific properties
    isAccreditedBy: {
      '@type': 'Organization',
      name: 'Central Board of Secondary Education (CBSE)',
      url: 'https://www.cbse.gov.in',
    },
  };
}

export function generateWebsiteSchema(school: SchoolInfo) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${school.url}/#website`,
    name: school.name,
    description: school.description,
    url: school.url,
    publisher: {
      '@id': `${school.url}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${school.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    inLanguage: ['en-IN', 'hi-IN'],
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export interface FAQItem {
  question: string;
  answer: string;
}

export function generateFAQSchema(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export interface EventInfo {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location?: string;
  url: string;
  image?: string;
}

export function generateEventSchema(event: EventInfo, schoolUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate || event.startDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.location || 'Sri Laxmi Narayan Saraswati Vidya Mandir',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Bhagwanpur',
        addressRegion: 'Bihar',
        addressCountry: 'IN',
      },
    },
    organizer: {
      '@id': `${schoolUrl}/#organization`,
    },
    image: event.image,
    url: event.url,
  };
}

export function generateSchoolPageSchema(
  school: SchoolInfo,
  pageType: 'home' | 'about' | 'admissions' | 'contact' | 'academics',
  pagePath: string
) {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${school.url}${pagePath}`,
    url: `${school.url}${pagePath}`,
    isPartOf: {
      '@id': `${school.url}/#website`,
    },
    about: {
      '@id': `${school.url}/#organization`,
    },
    inLanguage: 'en-IN',
  };

  const pageSpecificData: Record<string, object> = {
    home: {
      name: `${school.name} - Excellence in Education`,
      description: school.description,
    },
    about: {
      name: `About Us - ${school.name}`,
      description: `Learn about ${school.name}'s mission, vision, and history.`,
    },
    admissions: {
      name: `Admissions - ${school.name}`,
      description: `Apply for admission at ${school.name}. Learn about our admission process and eligibility criteria.`,
    },
    contact: {
      name: `Contact Us - ${school.name}`,
      description: `Get in touch with ${school.name}. Find our address, phone number, and email.`,
    },
    academics: {
      name: `Academics - ${school.name}`,
      description: `Explore our CBSE curriculum, subjects offered, and academic programs.`,
    },
  };

  return {
    ...baseSchema,
    ...pageSpecificData[pageType],
  };
}

// Default school information
export const schoolInfo: SchoolInfo = {
  name: 'Sri Laxmi Narayan Saraswati Vidya Mandir',
  description:
    'Sri Laxmi Narayan Saraswati Vidya Mandir (CBSE Affiliated School, Bhagwanpur, Vaishali) provides quality education with a focus on academic excellence, character building, and holistic development. Affiliation No: 330621, School No: 65617',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://www.slnsvm.com',
  logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.slnsvm.com'}/images/logo.png`,
  image: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.slnsvm.com'}/images/school-building.jpg`,
  address: {
    streetAddress: 'Bhagwanpur',
    addressLocality: 'Vaishali',
    addressRegion: 'Bihar',
    postalCode: '844114',
    addressCountry: 'IN',
  },
  telephone: '+91-XXXXXXXXXX',
  email: 'info@slnsvm.com',
  foundingDate: '2000',
  sameAs: [
    // Add social media links when available
    // 'https://www.facebook.com/slnsvm',
    // 'https://www.instagram.com/slnsvm',
  ],
};
