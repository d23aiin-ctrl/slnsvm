'use client';

import { Card, CardContent } from '@/components/ui/Card';
import {
  Building2, BookOpen, FlaskConical, Monitor, Trophy, Bus,
  Utensils, Stethoscope, Shield, Wifi, Camera, Droplets,
  Music, Palette, Calculator, Globe
} from 'lucide-react';

const facilities = [
  {
    category: 'Academic Facilities',
    items: [
      {
        icon: Building2,
        title: 'Smart Classrooms',
        description: 'Air-conditioned classrooms equipped with smart boards, projectors, and audio-visual aids for interactive learning.',
        features: ['45 Classrooms', 'Smart Boards', 'Projectors', 'AC Facilities'],
      },
      {
        icon: BookOpen,
        title: 'Library',
        description: 'Well-stocked library with over 10,000 books, journals, magazines, and digital resources for students and staff.',
        features: ['10,000+ Books', 'Digital Library', 'Reading Room', 'Reference Section'],
      },
      {
        icon: FlaskConical,
        title: 'Science Laboratories',
        description: 'State-of-the-art Physics, Chemistry, and Biology labs with modern equipment for practical experiments.',
        features: ['Physics Lab', 'Chemistry Lab', 'Biology Lab', 'Modern Equipment'],
      },
      {
        icon: Monitor,
        title: 'Computer Lab',
        description: 'Modern computer lab with latest systems, high-speed internet, and licensed software for digital learning.',
        features: ['50+ Computers', 'High-speed Internet', 'Licensed Software', 'Programming Classes'],
      },
      {
        icon: Calculator,
        title: 'Mathematics Lab',
        description: 'Dedicated mathematics laboratory with models, charts, and tools for practical understanding of concepts.',
        features: ['Mathematical Models', 'Activity Kits', 'Geometry Tools', 'Visual Learning'],
      },
      {
        icon: Globe,
        title: 'Social Science Lab',
        description: 'Geography and Social Science lab with maps, globes, and teaching aids for comprehensive learning.',
        features: ['Maps & Globes', 'Historical Models', 'Teaching Aids', 'Project Materials'],
      },
    ],
  },
  {
    category: 'Sports & Recreation',
    items: [
      {
        icon: Trophy,
        title: 'Sports Ground',
        description: 'Large playground with facilities for cricket, football, volleyball, basketball, and athletics.',
        features: ['Cricket Ground', 'Football Field', 'Basketball Court', 'Running Track'],
      },
      {
        icon: Trophy,
        title: 'Indoor Sports',
        description: 'Indoor sports facilities including table tennis, chess, carrom, and badminton.',
        features: ['Table Tennis', 'Chess', 'Carrom', 'Badminton'],
      },
      {
        icon: Music,
        title: 'Music Room',
        description: 'Well-equipped music room with various instruments for vocal and instrumental music training.',
        features: ['Harmonium', 'Tabla', 'Keyboards', 'Vocal Training'],
      },
      {
        icon: Palette,
        title: 'Art & Craft Room',
        description: 'Dedicated space for art and craft activities with all necessary materials and guidance.',
        features: ['Art Supplies', 'Craft Materials', 'Display Area', 'Expert Guidance'],
      },
    ],
  },
  {
    category: 'Health & Safety',
    items: [
      {
        icon: Stethoscope,
        title: 'Medical Room',
        description: 'On-campus medical facility with trained nurse and first-aid equipment for emergencies.',
        features: ['Trained Nurse', 'First Aid', 'Regular Checkups', 'Emergency Care'],
      },
      {
        icon: Shield,
        title: 'Security',
        description: '24/7 security with CCTV surveillance, security guards, and visitor management system.',
        features: ['CCTV Cameras', 'Security Guards', 'Visitor Management', 'Fire Safety'],
      },
      {
        icon: Droplets,
        title: 'Safe Drinking Water',
        description: 'RO purified drinking water available at multiple points throughout the campus.',
        features: ['RO Purifiers', 'Multiple Points', 'Regular Testing', 'Clean Facilities'],
      },
      {
        icon: Camera,
        title: 'CCTV Surveillance',
        description: 'Complete campus coverage with CCTV cameras for safety and security of students.',
        features: ['100+ Cameras', 'Recording System', '24/7 Monitoring', 'Digital Storage'],
      },
    ],
  },
  {
    category: 'Other Facilities',
    items: [
      {
        icon: Bus,
        title: 'Transport',
        description: 'Safe and comfortable bus service covering major areas of Bhagwanpur and surrounding villages.',
        features: ['10+ Buses', 'GPS Tracking', 'Trained Drivers', 'Female Attendants'],
      },
      {
        icon: Utensils,
        title: 'Canteen',
        description: 'Hygienic canteen serving nutritious and healthy food at affordable prices.',
        features: ['Healthy Food', 'Hygienic Kitchen', 'Affordable Prices', 'Vegetarian Options'],
      },
      {
        icon: Wifi,
        title: 'Wi-Fi Campus',
        description: 'High-speed Wi-Fi connectivity across the campus for digital learning and research.',
        features: ['High Speed', 'Campus Wide', 'Secure Network', 'Student Access'],
      },
      {
        icon: Building2,
        title: 'Auditorium',
        description: 'Modern auditorium with seating capacity of 500+ for events, seminars, and cultural programs.',
        features: ['500+ Capacity', 'Sound System', 'Stage Lighting', 'AC Facility'],
      },
    ],
  },
];

const transportRoutes = [
  { route: 'Route 1', areas: 'Bhagwanpur Market, Railway Station, Main Road', timing: '7:00 AM' },
  { route: 'Route 2', areas: 'Lalganj, Mahua, Desri', timing: '6:45 AM' },
  { route: 'Route 3', areas: 'Hajipur Road, Jandaha, Mahnar', timing: '6:30 AM' },
  { route: 'Route 4', areas: 'Vaishali Nagar, Gandhi Chowk, New Colony', timing: '7:15 AM' },
  { route: 'Route 5', areas: 'Raghopur, Bidupur, Patepur', timing: '6:45 AM' },
];

export default function FacilitiesPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-4">
            <Building2 className="w-10 h-10 mr-4" />
            <h1 className="text-4xl font-bold">Facilities & Infrastructure</h1>
          </div>
          <p className="text-xl text-primary-100 max-w-3xl">
            Sri Laxmi Narayan Saraswati Vidya Mandir provides world-class facilities
            to ensure holistic development of every student.
          </p>
        </div>
      </section>

      {/* Campus Overview */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="p-6 bg-primary-50 rounded-xl">
              <div className="text-3xl font-bold text-primary-600">5</div>
              <div className="text-gray-600">Acres Campus</div>
            </div>
            <div className="p-6 bg-secondary-50 rounded-xl">
              <div className="text-3xl font-bold text-secondary-600">45</div>
              <div className="text-gray-600">Classrooms</div>
            </div>
            <div className="p-6 bg-blue-50 rounded-xl">
              <div className="text-3xl font-bold text-blue-600">6</div>
              <div className="text-gray-600">Laboratories</div>
            </div>
            <div className="p-6 bg-purple-50 rounded-xl">
              <div className="text-3xl font-bold text-purple-600">10+</div>
              <div className="text-gray-600">Transport Buses</div>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities by Category */}
      {facilities.map((category) => (
        <section key={category.category} className="py-12 odd:bg-gray-50 even:bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">{category.category}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.items.map((facility) => (
                <Card key={facility.title} variant="elevated" className="hover:shadow-xl transition-shadow">
                  <CardContent>
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                      <facility.icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{facility.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{facility.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {facility.features.map((feature) => (
                        <span key={feature} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Transport Routes */}
      <section className="py-12 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Bus className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">School Transport Routes</h2>
            <p className="text-gray-600">Safe and reliable transport service covering major areas</p>
          </div>

          <Card variant="elevated">
            <CardContent className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Route</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Areas Covered</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Pick-up Time</th>
                  </tr>
                </thead>
                <tbody>
                  {transportRoutes.map((route) => (
                    <tr key={route.route} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-medium text-primary-600">{route.route}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{route.areas}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 text-sm rounded">
                          {route.timing}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              For transport inquiries, please contact: <strong>+91 9430218068</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Virtual Tour CTA */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card variant="elevated" className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
            <CardContent className="text-center py-8">
              <h2 className="text-2xl font-bold mb-4">Visit Our Campus</h2>
              <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
                Experience our world-class facilities firsthand. Schedule a campus visit
                and see why Sri Laxmi Narayan Saraswati Vidya Mandir is the right choice for your child.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium"
              >
                Schedule a Visit
              </a>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
