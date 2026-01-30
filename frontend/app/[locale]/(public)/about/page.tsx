import { Card, CardContent } from '@/components/ui/Card';
import Image from 'next/image';
import { Target, Eye, Award, Users, BookOpen, Heart } from 'lucide-react';

const values = [
  { icon: BookOpen, title: 'Excellence', description: 'Striving for the highest standards in education and personal growth.' },
  { icon: Heart, title: 'Integrity', description: 'Building character through honesty, ethics, and moral values.' },
  { icon: Users, title: 'Inclusivity', description: 'Creating a welcoming environment for students from all backgrounds.' },
  { icon: Award, title: 'Innovation', description: 'Embracing modern teaching methods and technology in education.' },
];

const leadership = [
  { name: 'Principal', role: 'Principal', image: '/images/leadership/Prinicipal.jpeg' },
  { name: 'President', role: 'President', image: '/images/leadership/President.jpeg' },
  { name: 'Secretary', role: 'Secretary', image: '/images/leadership/Secretery.png' },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">About Sri Laxmi Narayan Saraswati Vidya Mandir</h1>
          <p className="text-xl text-primary-100 max-w-3xl">
            Established with a vision to provide quality education, Sri Laxmi Narayan Saraswati Vidya Mandir has been
            nurturing young minds for over 25 years.
          </p>
          <p className="text-sm text-primary-200 mt-4">
            CBSE Affiliated School, Bhagwanpur, Vaishali | Affiliation No: 330621 | School No: 65617
          </p>
        </div>
      </section>

      {/* History Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Sri Laxmi Narayan Saraswati Vidya Mandir was founded in 1998 with a humble beginning of just 50 students
                and 5 teachers. Today, we stand proud as one of the leading CBSE affiliated educational
                institutions in Bhagwanpur, Vaishali.
              </p>
              <p className="text-gray-600 mb-4">
                Our journey has been marked by continuous growth, academic achievements, and
                the success stories of thousands of alumni who have gone on to excel in
                various fields across the globe.
              </p>
              <p className="text-gray-600">
                We remain committed to our founding principles of providing quality education
                that nurtures not just academic excellence but also moral values and life skills.
              </p>
            </div>
            <div className="bg-gray-100 rounded-xl p-4">
              <Image
                src="/images/slides/s2.jpg"
                alt="SLNSVM School Campus"
                width={1200}
                height={640}
                className="rounded-lg h-64 w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Card variant="elevated">
              <CardContent>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                    <Eye className="w-6 h-6 text-primary-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
                </div>
                <p className="text-gray-600">
                  To be a premier educational institution that nurtures future leaders
                  equipped with knowledge, skills, and values to contribute positively
                  to society and excel in a globalized world.
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mr-4">
                    <Target className="w-6 h-6 text-secondary-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
                </div>
                <p className="text-gray-600">
                  To provide holistic education that fosters academic excellence,
                  character development, and critical thinking through innovative
                  teaching methods and a supportive learning environment.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Core Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">School Leadership</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {leadership.map((person, index) => (
              <div
                key={person.name}
                className={`flex justify-center ${index === 0 ? 'md:col-span-2' : ''}`}
              >
                <Card
                  variant="elevated"
                  className={`text-center w-full ${index === 0 ? 'max-w-sm' : ''}`}
                >
                  <CardContent>
                    <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden bg-gray-200 border-2 border-primary-300">
                      <Image
                        src={person.image}
                        alt={person.name}
                        width={128}
                        height={128}
                        className="w-full h-full object-contain"
                      />
                    </div>
                                      <h3 className="text-xl font-semibold text-gray-900">{person.role}</h3>                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Infrastructure */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Infrastructure</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              'Smart Classrooms', 'Science Labs', 'Computer Lab',
              'Library', 'Sports Ground', 'Auditorium',
              'Art Room', 'Music Room', 'Medical Room'
            ].map((facility) => (
              <div key={facility} className="bg-gray-50 rounded-lg p-6 text-center hover:bg-primary-50 transition-colors">
                <p className="font-medium text-gray-900">{facility}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
