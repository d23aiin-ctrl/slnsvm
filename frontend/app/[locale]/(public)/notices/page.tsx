'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Bell, Calendar, Download, ChevronRight, Search, Filter } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Notice {
  id: number;
  title: string;
  content: string;
  category: string;
  date: string;
  attachment_url?: string;
  priority: 'normal' | 'important' | 'urgent';
}

const categories = ['All', 'Academic', 'Events', 'Examinations', 'Holidays', 'Circulars', 'Admissions'];

// Sample notices data
const sampleNotices: Notice[] = [
  {
    id: 1,
    title: 'Admissions Open for 2025-26 Academic Year',
    content: 'Sri Laxmi Narayan Saraswati Vidya Mandir announces admissions for classes Nursery to XII for the academic year 2025-26. Application forms are available at the school office and online.',
    category: 'Admissions',
    date: '2025-01-15',
    priority: 'important',
  },
  {
    id: 2,
    title: 'Annual Sports Day - February 20, 2025',
    content: 'The Annual Sports Day will be celebrated on February 20, 2025. All students are requested to participate actively. Parents are cordially invited to attend.',
    category: 'Events',
    date: '2025-01-12',
    priority: 'normal',
  },
  {
    id: 3,
    title: 'Parent-Teacher Meeting Schedule',
    content: 'PTM for all classes will be held on January 25, 2025 from 10:00 AM to 2:00 PM. Parents are requested to attend without fail to discuss their ward\'s progress.',
    category: 'Academic',
    date: '2025-01-10',
    priority: 'important',
  },
  {
    id: 4,
    title: 'Republic Day Celebration',
    content: 'Republic Day will be celebrated in the school premises on January 26, 2025. All students must report by 8:00 AM in proper uniform.',
    category: 'Events',
    date: '2025-01-08',
    priority: 'normal',
  },
  {
    id: 5,
    title: 'Pre-Board Examination Schedule',
    content: 'Pre-Board examinations for classes X and XII will commence from February 1, 2025. Detailed date sheet has been uploaded.',
    category: 'Examinations',
    date: '2025-01-05',
    attachment_url: '/documents/preboard-datesheet.pdf',
    priority: 'urgent',
  },
  {
    id: 6,
    title: 'Winter Vacation Notice',
    content: 'School will remain closed from December 25, 2024 to January 1, 2025 for winter vacation. Classes will resume on January 2, 2025.',
    category: 'Holidays',
    date: '2024-12-20',
    priority: 'normal',
  },
  {
    id: 7,
    title: 'Fee Payment Reminder',
    content: 'Parents are requested to clear all pending fees by January 31, 2025 to avoid late payment charges. Online payment facility is available.',
    category: 'Circulars',
    date: '2025-01-02',
    priority: 'important',
  },
  {
    id: 8,
    title: 'Science Exhibition 2025',
    content: 'Annual Science Exhibition will be held on February 10, 2025. Students from classes VI to XII are encouraged to participate with innovative projects.',
    category: 'Events',
    date: '2025-01-03',
    priority: 'normal',
  },
];

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>(sampleNotices);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotices = notices.filter(notice => {
    const matchesCategory = selectedCategory === 'All' || notice.category === selectedCategory;
    const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notice.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'important': return 'bg-primary-100 text-primary-800 border-primary-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Academic': 'bg-blue-100 text-blue-700',
      'Events': 'bg-purple-100 text-purple-700',
      'Examinations': 'bg-red-100 text-red-700',
      'Holidays': 'bg-green-100 text-green-700',
      'Circulars': 'bg-yellow-100 text-yellow-700',
      'Admissions': 'bg-primary-100 text-primary-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-4">
            <Bell className="w-10 h-10 mr-4" />
            <h1 className="text-4xl font-bold">Notices & Announcements</h1>
          </div>
          <p className="text-xl text-primary-100 max-w-3xl">
            Stay updated with the latest news, circulars, and important announcements
            from Sri Laxmi Narayan Saraswati Vidya Mandir.
          </p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-6 bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search notices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Notices List */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredNotices.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No notices found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotices.map((notice) => (
                <Card key={notice.id} variant="elevated" className="hover:shadow-lg transition-shadow">
                  <CardContent>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(notice.category)}`}>
                            {notice.category}
                          </span>
                          {notice.priority !== 'normal' && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(notice.priority)}`}>
                              {notice.priority.charAt(0).toUpperCase() + notice.priority.slice(1)}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{notice.title}</h3>
                        <p className="text-gray-600 mb-3">{notice.content}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(notice.date)}
                        </div>
                      </div>
                      {notice.attachment_url && (
                        <button className="flex items-center px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Subscribe Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card variant="elevated" className="bg-gradient-to-r from-primary-50 to-secondary-50">
            <CardContent>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Stay Updated</h2>
                <p className="text-gray-600 mb-6">
                  Subscribe to receive important notices and updates directly to your email.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
                    Subscribe
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
