import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | Sri Laxmi Narayan Saraswati Vidya Mandir',
    default: 'Sri Laxmi Narayan Saraswati Vidya Mandir - Excellence in Education',
  },
  description: 'Sri Laxmi Narayan Saraswati Vidya Mandir (CBSE Affiliated School, Bhagwanpur, Vaishali) provides quality education with a focus on academic excellence, character building, and holistic development. Affiliation No: 330621, School No: 65617',
  keywords: ['school', 'education', 'CBSE', 'academics', 'admissions', 'Bhagwanpur', 'Vaishali', 'Sri Laxmi Narayan Saraswati Vidya Mandir', 'Bihar', 'best school'],
  icons: {
    icon: '/images/favicon.png',
    apple: '/images/favicon.png',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.slnsvm.com'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://www.slnsvm.com',
    siteName: 'Sri Laxmi Narayan Saraswati Vidya Mandir',
    title: 'Sri Laxmi Narayan Saraswati Vidya Mandir - Excellence in Education',
    description: 'CBSE Affiliated School providing quality education in Bhagwanpur, Vaishali',
    images: [
      {
        url: '/images/school-building.jpg',
        width: 1200,
        height: 630,
        alt: 'Sri Laxmi Narayan Saraswati Vidya Mandir Campus',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sri Laxmi Narayan Saraswati Vidya Mandir',
    description: 'CBSE Affiliated School in Bhagwanpur, Vaishali - Excellence in Education',
    images: ['/images/school-building.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here
    // google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-gray-50`}>
        {children}
      </body>
    </html>
  );
}
