import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Don't add locale prefix for default locale
  localePrefix: 'as-needed',
});

export const config = {
  // Match only internationalized pathnames
  // Skip api routes, static files, images, etc.
  matcher: [
    // Match all pathnames except for
    // - /api (API routes)
    // - /_next (Next.js internals)
    // - /images, /fonts (public files)
    // - favicon.ico, robots.txt, sitemap.xml
    '/((?!api|_next|images|fonts|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
