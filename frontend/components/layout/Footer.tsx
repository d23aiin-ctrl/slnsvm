'use client';

import { Link } from '@/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

// Quick links split into two columns for better balance
const quickLinksColumn1 = [
  { key: 'about', href: '/about' },
  { key: 'academics', href: '/academics' },
  { key: 'faculty', href: '/faculty' },
  { key: 'facilities', href: '/facilities' },
  { key: 'admissions', href: '/admissions' },
];

const quickLinksColumn2 = [
  { key: 'events', href: '/events' },
  { key: 'notices', href: '/notices' },
  { key: 'gallery', href: '/gallery' },
  { key: 'contact', href: '/contact' },
];

export default function Footer() {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const tFooter = useTranslations('footer');
  const tPortal = useTranslations('portal');

  // Portal links
  const portalLinks = [
    { name: tPortal('student.title'), href: '/login?role=student' },
    { name: tPortal('parent.title'), href: '/login?role=parent' },
    { name: tPortal('teacher.title'), href: '/login?role=teacher' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* School Info - Takes 3 columns */}
          <div className="lg:col-span-3">
            <div className="flex items-start space-x-3 mb-4">
              <Image
                src="/images/logo.png"
                alt="SLNSVM Logo"
                width={48}
                height={48}
                className="h-12 w-12 bg-white rounded-full p-0.5 flex-shrink-0"
              />
              <div className="min-w-0">
                <h3 className="text-base font-bold leading-tight">श्री लक्ष्मी नारायण</h3>
                <p className="text-sm text-gray-300">सरस्वती विद्या मंदिर</p>
                <p className="text-xs text-primary-400 italic mt-0.5">विद्या ददाति विनयम्</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Bhagwanpur, Vaishali, Bihar - 844114
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links - Takes 3 columns */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">
              {tFooter('quickLinks')}
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <ul className="space-y-2">
                {quickLinksColumn1.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {t(item.key)}
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="space-y-2">
                {quickLinksColumn2.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {t(item.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Portals - Takes 2 columns */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">
              Portals
            </h3>
            <ul className="space-y-2">
              {portalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info - Takes 4 columns */}
          <div className="lg:col-span-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">
              {tFooter('contactInfo')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4 text-primary-400" />
                </div>
                <div className="text-gray-400 text-sm pt-1">
                  Bhagwanpur, Vaishali,<br />
                  Bihar - 844114
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="h-4 w-4 text-primary-400" />
                </div>
                <div className="text-sm pt-1">
                  <a href="tel:+919430218068" className="text-gray-400 hover:text-white block">
                    Principal: +91 9430218068
                  </a>
                  <a href="tel:+918292177298" className="text-gray-400 hover:text-white block">
                    Chairman: +91 8292177298
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4 text-primary-400" />
                </div>
                <a href="mailto:slnsvman1998@gmail.com" className="text-gray-400 hover:text-white text-sm pt-1">
                  slnsvman1998@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm text-center sm:text-left">
              &copy; {new Date().getFullYear()} {tCommon('schoolName')}. {tFooter('copyright')}.
            </p>
            <div className="flex items-center space-x-6">
              <Link href="/privacy" className="text-gray-500 hover:text-white text-sm transition-colors">
                {tFooter('privacyPolicy')}
              </Link>
              <Link href="/terms" className="text-gray-500 hover:text-white text-sm transition-colors">
                {tFooter('termsOfService')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
