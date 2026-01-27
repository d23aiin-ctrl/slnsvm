import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatBot from '@/components/features/ChatBot';
import JsonLd from '@/components/seo/JsonLd';
import {
  generateOrganizationSchema,
  generateWebsiteSchema,
  schoolInfo,
} from '@/lib/jsonld';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Generate structured data for the entire site
  const organizationSchema = generateOrganizationSchema(schoolInfo);
  const websiteSchema = generateWebsiteSchema(schoolInfo);

  return (
    <div className="flex flex-col min-h-screen">
      {/* JSON-LD Structured Data */}
      <JsonLd data={[organizationSchema, websiteSchema]} />

      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatBot />
    </div>
  );
}
