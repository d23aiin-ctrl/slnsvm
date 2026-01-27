import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FileText, Download } from 'lucide-react';

const disclosures = [
  {
    category: 'General Information',
    items: [
      { label: 'School Name', value: 'Sri Laxmi Narayan Saraswati Vidya Mandir' },
      { label: 'Affiliation No.', value: '330621' },
      { label: 'School Code', value: '65617' },
      { label: 'Address', value: 'Bhagwanpur, Vaishali, Bihar - 844114' },
      { label: 'Email', value: 'slnsvman1998@gmail.com' },
      { label: 'Principal Phone', value: '+91 9430218068' },
      { label: 'Chairman Phone', value: '+91 8292177298' },
    ],
  },
  {
    category: 'Documents & Information',
    items: [
      { label: 'Copies of Affiliation/Upgradation Letter', link: true },
      { label: 'Copies of Societies/Trust/Company Registration', link: true },
      { label: 'Copy of No Objection Certificate (NOC)', link: true },
      { label: 'Copy of Recognition Certificate', link: true },
      { label: 'Copy of Building Safety Certificate', link: true },
      { label: 'Copy of Fire Safety Certificate', link: true },
      { label: 'Copy of DEO Certificate', link: true },
      { label: 'Copy of Water, Health and Sanitation Certificates', link: true },
    ],
  },
  {
    category: 'Result & Academics',
    items: [
      { label: 'Fee Structure', link: true },
      { label: 'Annual Academic Calendar', link: true },
      { label: 'List of School Management Committee (SMC)', link: true },
      { label: 'List of Parents Teachers Association (PTA) Members', link: true },
      { label: 'Last Three-Year Result of Board Exams', link: true },
    ],
  },
  {
    category: 'Staff Information',
    items: [
      { label: 'Principal', value: 'Dr. Rajesh Kumar, M.Sc., M.Ed., Ph.D.' },
      { label: 'Total Teaching Staff', value: '50' },
      { label: 'PGT', value: '15' },
      { label: 'TGT', value: '20' },
      { label: 'PRT', value: '15' },
      { label: 'Non-Teaching Staff', value: '25' },
    ],
  },
  {
    category: 'School Infrastructure',
    items: [
      { label: 'Total Campus Area', value: '5 Acres' },
      { label: 'Total Built Up Area', value: '50,000 sq. ft.' },
      { label: 'Number of Classrooms', value: '45' },
      { label: 'Size of Classrooms', value: '600 sq. ft.' },
      { label: 'Number of Labs', value: '6' },
      { label: 'Internet Facility', value: 'Yes' },
      { label: 'Library Facility', value: 'Yes (10,000+ Books)' },
      { label: 'Playground', value: 'Yes' },
      { label: 'Swimming Pool', value: 'No' },
      { label: 'Indoor Games', value: 'Yes' },
      { label: 'Gymnasium', value: 'Yes' },
    ],
  },
];

export default function CBSEDisclosurePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">CBSE Mandatory Disclosure</h1>
          <p className="text-xl text-primary-100 max-w-3xl">
            As per CBSE guidelines, we provide transparent information about our
            school&apos;s affiliation, infrastructure, and academic details.
          </p>
        </div>
      </section>

      {/* Disclosures */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {disclosures.map((section) => (
              <Card key={section.category} variant="elevated">
                <CardHeader className="bg-gray-50">
                  <CardTitle>{section.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {section.items.map((item) => (
                      <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">{item.label}</span>
                        {'link' in item ? (
                          <button className="flex items-center text-primary-600 hover:text-primary-700">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </button>
                        ) : (
                          <span className="font-medium text-gray-900">{'value' in item ? item.value : ''}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Information */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Important Note</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                All the above information is true to the best of our knowledge.
                For any queries or verification, please contact the school office
                during working hours or write to us at info@slnsvm.edu.
              </p>
              <p className="text-gray-600 mt-4">
                This information is displayed as per CBSE Circular No. Acad-09/2021
                regarding mandatory public disclosure on school website.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
