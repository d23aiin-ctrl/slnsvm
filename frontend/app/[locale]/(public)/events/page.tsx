'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight, Users } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: 'academic' | 'cultural' | 'sports' | 'holiday' | 'exam';
  image?: string;
}

const events: Event[] = [
  {
    id: 1,
    title: 'Republic Day Celebration',
    description: 'Flag hoisting ceremony followed by cultural programs and patriotic performances by students.',
    date: '2025-01-26',
    time: '8:00 AM',
    location: 'School Ground',
    category: 'cultural',
  },
  {
    id: 2,
    title: 'Pre-Board Examinations Begin',
    description: 'Pre-Board examinations for classes X and XII commence. Students are advised to prepare thoroughly.',
    date: '2025-02-01',
    time: '9:00 AM',
    location: 'Examination Hall',
    category: 'exam',
  },
  {
    id: 3,
    title: 'Science Exhibition 2025',
    description: 'Annual Science Exhibition showcasing innovative projects by students from classes VI to XII.',
    date: '2025-02-10',
    time: '10:00 AM - 4:00 PM',
    location: 'School Auditorium',
    category: 'academic',
  },
  {
    id: 4,
    title: 'Annual Sports Day',
    description: 'Annual Sports Day featuring various athletic events, competitions, and prize distribution ceremony.',
    date: '2025-02-20',
    time: '8:00 AM - 5:00 PM',
    location: 'School Sports Ground',
    category: 'sports',
  },
  {
    id: 5,
    title: 'Holi Celebration',
    description: 'Pre-Holi celebrations with colors, music, and traditional festivities. School closed on Holi.',
    date: '2025-03-13',
    time: '11:00 AM',
    location: 'School Campus',
    category: 'cultural',
  },
  {
    id: 6,
    title: 'Holi Holiday',
    description: 'School remains closed for Holi festival.',
    date: '2025-03-14',
    time: 'All Day',
    location: '-',
    category: 'holiday',
  },
  {
    id: 7,
    title: 'Annual Examinations Begin',
    description: 'Final examinations for all classes (I to IX, XI) commence.',
    date: '2025-03-01',
    time: '9:00 AM',
    location: 'Examination Halls',
    category: 'exam',
  },
  {
    id: 8,
    title: 'CBSE Board Exams - Class X',
    description: 'CBSE Board Examinations for Class X begin as per official schedule.',
    date: '2025-02-15',
    time: 'As per schedule',
    location: 'Examination Center',
    category: 'exam',
  },
  {
    id: 9,
    title: 'CBSE Board Exams - Class XII',
    description: 'CBSE Board Examinations for Class XII begin as per official schedule.',
    date: '2025-02-15',
    time: 'As per schedule',
    location: 'Examination Center',
    category: 'exam',
  },
  {
    id: 10,
    title: 'Annual Day Celebration',
    description: 'Grand Annual Day celebration with cultural performances, prize distribution, and chief guest address.',
    date: '2025-03-25',
    time: '4:00 PM onwards',
    location: 'School Auditorium',
    category: 'cultural',
  },
  {
    id: 11,
    title: 'Summer Vacation Begins',
    description: 'Summer vacation commences for all students.',
    date: '2025-05-15',
    time: '-',
    location: '-',
    category: 'holiday',
  },
];

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function EventsPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Events', color: 'bg-gray-100 text-gray-700' },
    { id: 'academic', label: 'Academic', color: 'bg-blue-100 text-blue-700' },
    { id: 'cultural', label: 'Cultural', color: 'bg-purple-100 text-purple-700' },
    { id: 'sports', label: 'Sports', color: 'bg-green-100 text-green-700' },
    { id: 'exam', label: 'Examinations', color: 'bg-red-100 text-red-700' },
    { id: 'holiday', label: 'Holidays', color: 'bg-yellow-100 text-yellow-700' },
  ];

  const getCategoryStyle = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.color || 'bg-gray-100 text-gray-700';
  };

  const filteredEvents = events
    .filter(event => {
      const eventDate = new Date(event.date);
      const matchesMonth = eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      return matchesMonth && matchesCategory;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getEventsForDate = (date: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Week day headers
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={`header-${i}`} className="text-center text-sm font-medium text-gray-500 py-2">
          {weekDays[i]}
        </div>
      );
    }

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDate(day);
      const isToday = new Date().getDate() === day &&
                      new Date().getMonth() === currentMonth &&
                      new Date().getFullYear() === currentYear;

      days.push(
        <div
          key={day}
          className={`p-2 min-h-[80px] border border-gray-100 rounded-lg ${
            isToday ? 'bg-primary-50 border-primary-300' : 'hover:bg-gray-50'
          }`}
        >
          <span className={`text-sm font-medium ${isToday ? 'text-primary-600' : 'text-gray-900'}`}>
            {day}
          </span>
          <div className="mt-1 space-y-1">
            {dayEvents.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className={`text-xs px-1 py-0.5 rounded truncate ${getCategoryStyle(event.category)}`}
                title={event.title}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-4">
            <Calendar className="w-10 h-10 mr-4" />
            <h1 className="text-4xl font-bold">Events & Calendar</h1>
          </div>
          <p className="text-xl text-primary-100 max-w-3xl">
            Stay informed about upcoming events, examinations, holidays, and important dates
            at Sri Laxmi Narayan Saraswati Vidya Mandir.
          </p>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <Card variant="elevated">
                <CardContent>
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={prevMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-900">
                      {months[currentMonth]} {currentYear}
                    </h2>
                    <button
                      onClick={nextMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Category Filter */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedCategory === cat.id
                            ? 'bg-primary-600 text-white'
                            : cat.color + ' hover:opacity-80'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {renderCalendar()}
                  </div>
                </CardContent>
              </Card>

              {/* Events for Selected Month */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Events in {months[currentMonth]} {currentYear}
                </h3>
                {filteredEvents.length === 0 ? (
                  <Card variant="bordered">
                    <CardContent className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No events scheduled for this month.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredEvents.map((event) => (
                      <Card key={event.id} variant="elevated" className="hover:shadow-lg transition-shadow">
                        <CardContent>
                          <div className="flex items-start gap-4">
                            <div className="bg-primary-100 rounded-lg p-3 text-center min-w-[60px]">
                              <div className="text-2xl font-bold text-primary-600">
                                {new Date(event.date).getDate()}
                              </div>
                              <div className="text-xs text-primary-500">
                                {months[new Date(event.date).getMonth()].slice(0, 3)}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryStyle(event.category)}`}>
                                  {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                                </span>
                              </div>
                              <h4 className="text-lg font-semibold text-gray-900 mb-1">{event.title}</h4>
                              <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {event.time}
                                </span>
                                {event.location !== '-' && (
                                  <span className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {event.location}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Upcoming Events */}
            <div>
              <Card variant="elevated" className="sticky top-24">
                <CardContent>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                    Upcoming Events
                  </h3>
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="border-l-4 border-primary-500 pl-3 py-1">
                        <p className="font-medium text-gray-900 text-sm">{event.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(event.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Download Calendar */}
                  <div className="mt-6 pt-6 border-t">
                    <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                      Download Academic Calendar
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
