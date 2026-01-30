'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/navigation';
import Image from 'next/image';
import {
  GraduationCap, BookOpen, Users, Award, ArrowRight, Calendar, Bell,
  ChevronRight, Star, Trophy, Target, Heart, Sparkles
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

const features = [
  {
    icon: GraduationCap,
    title: 'Quality Education',
    description: 'Experienced faculty ensuring academic excellence with modern teaching methods.',
  },
  {
    icon: BookOpen,
    title: 'Holistic Development',
    description: 'Focus on academics, sports, arts, and character building for complete growth.',
  },
  {
    icon: Users,
    title: 'Individual Attention',
    description: 'Optimal student-teacher ratio ensuring personalized learning experience.',
  },
  {
    icon: Award,
    title: 'Proven Results',
    description: 'Consistent academic achievements and competitive exam success record.',
  },
];

const stats = [
  { value: '25+', label: 'Years', icon: Trophy },
  { value: '5000+', label: 'Alumni', icon: Users },
  { value: '100%', label: 'Results', icon: Target },
  { value: '50+', label: 'Teachers', icon: GraduationCap },
];

const announcements = [
  { title: 'Admissions Open for 2025-26', date: 'Jan 15, 2025', type: 'admission', priority: 'high' },
  { title: 'Annual Sports Day - February 20', date: 'Jan 10, 2025', type: 'event', priority: 'medium' },
  { title: 'Parent-Teacher Meeting Schedule', date: 'Jan 5, 2025', type: 'notice', priority: 'low' },
];

const highlights = [
  'CBSE Affiliated School',
  'Smart Classrooms',
  'Sports Academy',
  'Computer Lab',
  'Library',
  'Transport',
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero Section - Modern Gradient Design */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient Orbs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/10 rounded-full blur-3xl" />

          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Floating Icons */}
          <div className={`absolute top-32 right-[15%] transition-all duration-1000 ${mounted ? 'opacity-20 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <BookOpen className="w-16 h-16 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }} />
          </div>
          <div className={`absolute bottom-32 left-[10%] transition-all duration-1000 delay-300 ${mounted ? 'opacity-20 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <GraduationCap className="w-20 h-20 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }} />
          </div>
          <div className={`absolute top-1/2 right-[5%] transition-all duration-1000 delay-500 ${mounted ? 'opacity-15 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Star className="w-12 h-12 animate-pulse" />
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-sm font-medium">Welcome to Excellence</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold mb-4 leading-tight">
                विद्या ददाति
                <span className="block text-primary-200">विनयम्</span>
              </h1>

              <p className="text-2xl text-primary-100 mb-2 font-light italic">
                &ldquo;Knowledge Gives Humility&rdquo;
              </p>

              <p className="text-lg text-primary-200 mb-8 max-w-xl leading-relaxed">
                At सरस्वती विद्या मन्दिर, we nurture young minds to become knowledgeable,
                humble, and responsible citizens who lead with wisdom and compassion.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-10">
                <Link href="/admissions">
                  <Button size="lg" className="bg-white text-primary-700 hover:bg-primary-50 shadow-lg shadow-black/20 font-semibold px-8">
                    Apply for Admission
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline" className="border-2 border-white/50 text-white hover:bg-white/10 backdrop-blur-sm">
                    Explore Our School
                  </Button>
                </Link>
              </div>

              {/* Quick Highlights */}
              <div className="flex flex-wrap gap-2">
                {highlights.map((item, index) => (
                  <span
                    key={item}
                    className={`inline-flex items-center gap-1 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm transition-all duration-500 ${
                      mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                    style={{ transitionDelay: `${index * 100 + 500}ms` }}
                  >
                    <ChevronRight className="w-3 h-3" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Content - School Image */}
            <div className={`relative transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'} flex justify-center items-center p-4`}>
              <div className="relative w-full h-auto max-w-lg aspect-[3/2] rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow border-4 border-primary-300">
                <Image
                  src="/images/leadership/School.png"
                  alt="School Image"
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="rounded-3xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
              Why Choose Us
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Excellence in Every Aspect
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide a nurturing environment that fosters academic excellence and personal growth.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                variant="elevated"
                className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <CardContent className="text-center p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
              Campus Life
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Life at सरस्वती विद्या मन्दिर
            </h2>
            <p className="text-lg text-gray-600">
              Glimpses of our vibrant school community
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <div key={num} className="relative aspect-square overflow-hidden rounded-xl group">
                <Image
                  src={`/images/gallery/${num}.jpg`}
                  alt={`School gallery ${num}`}
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/gallery">
              <Button variant="outline" size="lg">
                View Full Gallery <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <span className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
                Stay Updated
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Bell className="w-8 h-8 text-primary-600" />
                Latest Announcements
              </h2>
              <div className="space-y-4">
                {announcements.map((item, index) => (
                  <Card key={index} variant="bordered" className="hover:border-primary-300 hover:shadow-md transition-all">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-12 rounded-full ${
                          item.priority === 'high' ? 'bg-red-500' :
                          item.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.title}</h3>
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            {item.date}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Link href="/notices" className="inline-flex items-center text-primary-600 font-medium mt-6 hover:text-primary-700 group">
                View all announcements
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div>
              <span className="inline-block px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
                Now Enrolling
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Admission Open 2025-26
              </h2>
              <Card variant="elevated" className="bg-gradient-to-br from-primary-50 to-secondary-50 border-none">
                <CardContent className="p-6">
                  <p className="text-gray-700 mb-6 text-lg">
                    Join सरस्वती विद्या मन्दिर and be part of our excellence journey.
                    We are accepting applications for classes Nursery to XII.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center text-gray-700">
                      <span className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <ChevronRight className="w-4 h-4 text-primary-600" />
                      </span>
                      Application Deadline: March 31, 2025
                    </li>
                    <li className="flex items-center text-gray-700">
                      <span className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <ChevronRight className="w-4 h-4 text-primary-600" />
                      </span>
                      Entrance Test: April 15, 2025
                    </li>
                    <li className="flex items-center text-gray-700">
                      <span className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <ChevronRight className="w-4 h-4 text-primary-600" />
                      </span>
                      Results: April 30, 2025
                    </li>
                  </ul>
                  <Link href="/admissions">
                    <Button className="w-full" size="lg">
                      Start Application <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="cta-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="2" fill="white"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cta-grid)" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Heart className="w-12 h-12 text-primary-200 mx-auto mb-6" />
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Join Our School Family?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Take the first step towards a bright future. Schedule a campus visit or apply now.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact">
              <Button size="lg" className="bg-white text-primary-600 hover:bg-primary-50 shadow-lg">
                Schedule a Visit
              </Button>
            </Link>
            <Link href="/admissions">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10">
                Apply Online
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
