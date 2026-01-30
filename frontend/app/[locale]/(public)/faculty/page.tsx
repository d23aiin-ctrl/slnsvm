'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/Card';
import { Users, GraduationCap, Award, BookOpen, Mail, Phone } from 'lucide-react';

interface Faculty {
  id: number;
  name: string;
  designation: string;
  qualification: string;
  experience: string;
  subjects: string[];
  image: string;
  email?: string;
  department: string;
}

const facultyMembers: Faculty[] = [
  {
    id: 1,
    name: 'Principal',
    designation: 'Principal',
    qualification: 'M.A., M.Ed., Ph.D.',
    experience: '25+ Years',
    subjects: ['Administration', 'Leadership'],
    image: '/images/leadership/Prinicipal.jpeg',
    department: 'Administration',
  },

  {
    id: 3,
    name: 'Dr. Anita Sharma',
    designation: 'Vice Principal',
    qualification: 'M.Sc., B.Ed.',
    experience: '20 Years',
    subjects: ['Mathematics'],
    image: '/images/faculty/default.jpg',
    department: 'Administration',
  },
  {
    id: 4,
    name: 'Mr. Rajesh Kumar',
    designation: 'PGT',
    qualification: 'M.Sc., B.Ed.',
    experience: '15 Years',
    subjects: ['Physics'],
    image: '/images/faculty/default.jpg',
    department: 'Science',
  },
  {
    id: 5,
    name: 'Mrs. Sunita Devi',
    designation: 'PGT',
    qualification: 'M.Sc., B.Ed.',
    experience: '12 Years',
    subjects: ['Chemistry'],
    image: '/images/faculty/default.jpg',
    department: 'Science',
  },
  {
    id: 6,
    name: 'Mr. Anil Verma',
    designation: 'PGT',
    qualification: 'M.Sc., B.Ed.',
    experience: '10 Years',
    subjects: ['Biology'],
    image: '/images/faculty/default.jpg',
    department: 'Science',
  },
  {
    id: 7,
    name: 'Mrs. Kavita Singh',
    designation: 'PGT',
    qualification: 'M.A., B.Ed.',
    experience: '14 Years',
    subjects: ['English'],
    image: '/images/faculty/default.jpg',
    department: 'Languages',
  },
  {
    id: 8,
    name: 'Mr. Suresh Prasad',
    designation: 'PGT',
    qualification: 'M.A., B.Ed.',
    experience: '18 Years',
    subjects: ['Hindi'],
    image: '/images/faculty/default.jpg',
    department: 'Languages',
  },
  {
    id: 9,
    name: 'Mrs. Priya Kumari',
    designation: 'TGT',
    qualification: 'M.A., B.Ed.',
    experience: '8 Years',
    subjects: ['Social Science', 'History'],
    image: '/images/faculty/default.jpg',
    department: 'Humanities',
  },
  {
    id: 10,
    name: 'Mr. Vikash Kumar',
    designation: 'TGT',
    qualification: 'M.Sc., B.Ed.',
    experience: '6 Years',
    subjects: ['Mathematics'],
    image: '/images/faculty/default.jpg',
    department: 'Science',
  },
  {
    id: 11,
    name: 'Mrs. Rekha Sinha',
    designation: 'TGT',
    qualification: 'MCA, B.Ed.',
    experience: '10 Years',
    subjects: ['Computer Science'],
    image: '/images/faculty/default.jpg',
    department: 'Computer',
  },
  {
    id: 12,
    name: 'Mr. Ravi Shankar',
    designation: 'PRT',
    qualification: 'B.A., D.El.Ed.',
    experience: '8 Years',
    subjects: ['Primary Classes'],
    image: '/images/faculty/default.jpg',
    department: 'Primary',
  },
  {
    id: 13,
    name: 'Mrs. Meena Kumari',
    designation: 'PRT',
    qualification: 'B.A., D.El.Ed.',
    experience: '12 Years',
    subjects: ['Primary Classes'],
    image: '/images/faculty/default.jpg',
    department: 'Primary',
  },
  {
    id: 14,
    name: 'Mr. Santosh Kumar',
    designation: 'Physical Education Teacher',
    qualification: 'B.P.Ed., M.P.Ed.',
    experience: '15 Years',
    subjects: ['Physical Education', 'Sports'],
    image: '/images/faculty/default.jpg',
    department: 'Sports',
  },
  {
    id: 15,
    name: 'Mrs. Sarita Devi',
    designation: 'Art & Craft Teacher',
    qualification: 'B.F.A.',
    experience: '10 Years',
    subjects: ['Art', 'Craft'],
    image: '/images/faculty/default.jpg',
    department: 'Arts',
  },
];

const departments = ['All', 'Administration', 'Science', 'Languages', 'Humanities', 'Computer', 'Primary', 'Sports', 'Arts'];

const stats = [
  { icon: Users, value: '50+', label: 'Teaching Staff' },
  { icon: GraduationCap, value: '15', label: 'PGT Teachers' },
  { icon: BookOpen, value: '20', label: 'TGT Teachers' },
  { icon: Award, value: '15', label: 'PRT Teachers' },
];

export default function FacultyPage() {
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  const filteredFaculty = selectedDepartment === 'All'
    ? facultyMembers
    : facultyMembers.filter(f => f.department === selectedDepartment);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-4">
            <Users className="w-10 h-10 mr-4" />
            <h1 className="text-4xl font-bold">Our Faculty</h1>
          </div>
          <p className="text-xl text-primary-100 max-w-3xl">
            Meet our dedicated team of experienced educators who are committed to
            nurturing young minds at Sri Laxmi Narayan Saraswati Vidya Mandir.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <stat.icon className="w-6 h-6 text-primary-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Department Filter */}
      <section className="py-6 bg-gray-50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedDepartment === dept
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Faculty Grid */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFaculty.map((faculty) => (
              <Card key={faculty.id} variant="elevated" className="hover:shadow-xl transition-shadow overflow-hidden">
                <div className="aspect-square bg-gray-200 relative overflow-hidden">
                  <Image
                    src={faculty.image}
                    alt={faculty.name}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    unoptimized
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23e5e7eb" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%239ca3af" font-size="40">👤</text></svg>';
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <span className="px-2 py-1 bg-primary-600 text-white text-xs rounded-full">
                      {faculty.designation}
                    </span>
                  </div>
                </div>
                <CardContent>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{faculty.name}</h3>
                  {faculty.qualification && (
                    <p className="text-sm text-gray-600 mb-2">{faculty.qualification}</p>
                  )}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {faculty.subjects.map((subject) => (
                      <span key={subject} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        {subject}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    <Award className="w-4 h-4 inline mr-1" />
                    {faculty.experience} Experience
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Join Our Team */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card variant="elevated" className="bg-gradient-to-r from-primary-50 to-secondary-50">
            <CardContent className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Our Team</h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                We are always looking for passionate and dedicated educators to join our family.
                If you share our vision of quality education, we would love to hear from you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:slnsvman1998@gmail.com"
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Send Your Resume
                </a>
                <a
                  href="tel:+919430218068"
                  className="inline-flex items-center px-6 py-3 bg-white text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Contact HR
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
