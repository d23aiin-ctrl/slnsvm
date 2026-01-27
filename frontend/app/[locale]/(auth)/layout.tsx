import { Link } from '@/navigation';
import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center space-y-2 text-white">
            <Image
              src="/images/logo.png"
              alt="Saraswati Vidya Mandir Logo"
              width={80}
              height={80}
              className="h-20 w-auto bg-white rounded-full p-1"
            />
            <div>
              <span className="text-2xl font-bold block">सरस्वती विद्या मन्दिर</span>
              <span className="text-sm text-primary-100">Saraswati Vidya Mandir, Gorakhpur</span>
            </div>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
