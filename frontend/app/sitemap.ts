import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.slnsvm.com';

// Define all public routes
const publicRoutes = [
  '',
  '/about',
  '/academics',
  '/admissions',
  '/contact',
  '/gallery',
  '/events',
  '/notices',
  '/faculty',
  '/facilities',
  '/cbse-disclosure',
  '/login',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [];

  // Generate sitemap entries for each route
  publicRoutes.forEach((route) => {
    // Add default (English) route without locale prefix
    routes.push({
      url: `${baseUrl}${route || '/'}`,
      lastModified: new Date(),
      changeFrequency: route === '' ? 'daily' : 'weekly',
      priority: route === '' ? 1 : 0.8,
    });

    // Add Hindi locale route
    routes.push({
      url: `${baseUrl}/hi${route || '/'}`,
      lastModified: new Date(),
      changeFrequency: route === '' ? 'daily' : 'weekly',
      priority: route === '' ? 0.9 : 0.7,
    });
  });

  return routes;
}
