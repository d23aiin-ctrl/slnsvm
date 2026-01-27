'use client';

import { useRouter, usePathname } from '@/navigation';
import { useLocale } from 'next-intl';
import { locales, localeNames, type Locale } from '@/i18n';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect, useTransition } from 'react';

interface LanguageSwitcherProps {
  variant?: 'light' | 'dark';
}

export default function LanguageSwitcher({ variant = 'light' }: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchLocale = (newLocale: Locale) => {
    setIsOpen(false);
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  const isDark = variant === 'dark';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={`flex items-center space-x-1 text-xs font-medium transition-colors px-2 py-1 rounded-md ${
          isDark
            ? 'text-white/90 hover:text-white hover:bg-white/10'
            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
        } ${isPending ? 'opacity-70 cursor-wait' : ''}`}
        aria-label="Switch language"
      >
        <Globe className={`w-3.5 h-3.5 ${isPending ? 'animate-spin' : ''}`} />
        <span>{localeNames[locale as Locale]}</span>
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border py-1 z-50">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => switchLocale(loc)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                locale === loc ? 'text-primary-600 font-medium bg-primary-50' : 'text-gray-700'
              }`}
            >
              {localeNames[loc]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
