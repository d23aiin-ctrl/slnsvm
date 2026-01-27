'use client';

import { useState, useRef, useEffect } from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import { Link, usePathname } from '@/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Menu, X, ChevronDown, User, LogOut, Phone, Mail, MapPin } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import Button from '../ui/Button';
import LanguageSwitcher from './LanguageSwitcher';

interface NavItem {
  key: string;
  href: string;
  children?: { key: string; href: string }[];
}

// Consolidated navigation - reduced from 10 to 5 main items with dropdowns
const navigationStructure: NavItem[] = [
  { key: 'home', href: '/' },
  {
    key: 'about',
    href: '/about',
    children: [
      { key: 'about', href: '/about' },
      { key: 'faculty', href: '/faculty' },
      { key: 'facilities', href: '/facilities' },
    ]
  },
  { key: 'academics', href: '/academics' },
  { key: 'admissions', href: '/admissions' },
  {
    key: 'more',
    href: '#',
    children: [
      { key: 'gallery', href: '/gallery' },
      { key: 'events', href: '/events' },
      { key: 'notices', href: '/notices' },
    ]
  },
  { key: 'contact', href: '/contact' },
];

function DropdownMenu({
  item,
  t,
  pathname,
  isOpen,
  onToggle,
  locale
}: {
  item: NavItem;
  t: any;
  pathname: string;
  isOpen: boolean;
  onToggle: () => void;
  locale: string;
}) {
  const isChildActive = item.children?.some(child => pathname === child.href || pathname.endsWith(child.href));

  // Build locale-aware href
  const getLocalizedHref = (href: string) => {
    if (locale === 'en') return href;
    return `/${locale}${href}`;
  };

  return (
    <div className="relative group">
      <button
        onClick={onToggle}
        className={cn(
          'flex items-center gap-1 text-sm font-medium transition-colors py-2 px-3',
          isChildActive
            ? 'text-primary-600'
            : 'text-gray-700 hover:text-primary-600'
        )}
      >
        {t(item.key)}
        <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 pointer-events-auto"
          style={{ zIndex: 9999, position: 'absolute' }}
        >
          {item.children?.map((child) => {
            const href = getLocalizedHref(child.href);
            return (
              <a
                key={child.key}
                href={href}
                style={{ pointerEvents: 'auto', display: 'block' }}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                onClick={(e) => {
                  console.log('Link clicked:', href);
                  window.location.href = href;
                }}
              >
                {t(child.key)}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);
  const pathname = usePathname();
  const locale = useLocale();
  const { user, isAuthenticated, logout } = useAuth();
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');

  const getPortalLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'student': return '/student';
      case 'parent': return '/parent';
      case 'teacher': return '/teacher';
      case 'admin': return '/admin';
      default: return '/login';
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top info bar */}
      <div className="bg-gradient-to-r from-primary-800 via-primary-700 to-primary-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-xs">
            {/* Contact info */}
            <div className="flex items-center divide-x divide-white/20">
              <a href="tel:+919430218068" className="flex items-center gap-1.5 pr-4 hover:text-white/80 transition-colors">
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">+91 9430218068</span>
                <span className="sm:hidden">Call</span>
              </a>
              <a href="mailto:slnsvman1998@gmail.com" className="hidden md:flex items-center gap-1.5 px-4 hover:text-white/80 transition-colors">
                <Mail className="w-3.5 h-3.5" />
                slnsvman1998@gmail.com
              </a>
              <span className="hidden lg:flex items-center gap-1.5 pl-4">
                <MapPin className="w-3.5 h-3.5" />
                Bhagwanpur, Vaishali, Bihar
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center divide-x divide-white/20">
              <div className="pr-3">
                <LanguageSwitcher variant="dark" />
              </div>
              <div className="pl-3">
                {isAuthenticated ? (
                  <Link href={getPortalLink()} className="flex items-center gap-1.5 hover:text-white/80 transition-colors font-medium">
                    <User className="w-3.5 h-3.5" />
                    {tCommon('goToPortal')}
                  </Link>
                ) : (
                  <Link href="/login" className="flex items-center gap-1.5 hover:text-white/80 transition-colors font-medium">
                    <User className="w-3.5 h-3.5" />
                    {tCommon('login')}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo - Improved layout */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Image
                src="/images/logo.png"
                alt="Saraswati Vidya Mandir Logo"
                width={64}
                height={64}
                className="h-16 w-16 rounded-full border-2 border-primary-100 group-hover:border-primary-300 transition-colors"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-primary-700 leading-tight">
                श्री लक्ष्मी नारायण सरस्वती विद्या मंदिर
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Sri Laxmi Narayan Saraswati Vidya Mandir
              </p>
              <p className="text-xs text-primary-600 italic">
                विद्या ददाति विनयम्
              </p>
            </div>
          </Link>

          {/* Desktop navigation - Consolidated */}
          <div className="hidden lg:flex items-center gap-1">
            {navigationStructure.map((item) => (
              item.children ? (
                <DropdownMenu
                  key={item.key}
                  item={item}
                  t={t}
                  pathname={pathname}
                  isOpen={openDropdown === item.key}
                  onToggle={() => setOpenDropdown(openDropdown === item.key ? null : item.key)}
                  locale={locale}
                />
              ) : (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    'px-3 py-2 text-sm font-medium transition-colors rounded-md',
                    pathname === item.href
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  )}
                >
                  {t(item.key)}
                </Link>
              )
            ))}
          </div>

          {/* Right side actions */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-gray-700 hover:text-primary-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                    <Link
                      href={getPortalLink()}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      {tCommon('myPortal')}
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {tCommon('logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/admissions">
                <Button size="sm" className="bg-primary-600 hover:bg-primary-700">
                  Apply Now
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile navigation - Improved */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t bg-white">
            <div className="space-y-1">
              {navigationStructure.map((item) => (
                <div key={item.key}>
                  {item.children ? (
                    <>
                      <button
                        onClick={() => setExpandedMobileMenu(expandedMobileMenu === item.key ? null : item.key)}
                        className={cn(
                          'w-full flex items-center justify-between px-4 py-3 text-base font-medium rounded-lg',
                          item.children.some(child => pathname === child.href)
                            ? 'text-primary-600 bg-primary-50'
                            : 'text-gray-700 hover:bg-gray-50'
                        )}
                      >
                        {t(item.key)}
                        <ChevronDown className={cn(
                          'w-5 h-5 transition-transform',
                          expandedMobileMenu === item.key && 'rotate-180'
                        )} />
                      </button>
                      {expandedMobileMenu === item.key && (
                        <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100">
                          {item.children.map((child) => (
                            <Link
                              key={child.key}
                              href={child.href}
                              className={cn(
                                'block pl-4 py-2 text-sm',
                                pathname === child.href
                                  ? 'text-primary-600 font-medium'
                                  : 'text-gray-600 hover:text-primary-600'
                              )}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {t(child.key)}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        'block px-4 py-3 text-base font-medium rounded-lg',
                        pathname === item.href
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t(item.key)}
                    </Link>
                  )}
                </div>
              ))}

              <div className="pt-4 mt-4 border-t">
                {isAuthenticated ? (
                  <>
                    <Link
                      href={getPortalLink()}
                      className="block px-4 py-3 text-base font-medium text-primary-600 hover:bg-primary-50 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {tCommon('myPortal')}
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                      {tCommon('logout')}
                    </button>
                  </>
                ) : (
                  <div className="px-4 space-y-2">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">{tCommon('login')}</Button>
                    </Link>
                    <Link href="/admissions" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full">Apply Now</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
