'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Calendar, Clock, Users, BookOpen } from 'lucide-react';
import { parentApi } from '@/lib/api';

interface TimetableEntry {
  period: number;
  start_time: string | null;
  end_time: string | null;
  subject_name: string | null;
  teacher_name: string | null;
  room: string | null;
}

interface ChildTimetable {
  student_id: number;
  student_name: string;
  class_name: string;
  section: string;
  timetable: Record<string, TimetableEntry[]>;
}

const DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DAY_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
};

export default function ParentTimetablePage() {
  const [childrenTimetable, setChildrenTimetable] = useState<ChildTimetable[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('');

  useEffect(() => {
    fetchTimetable();
  }, []);

  useEffect(() => {
    // Set initial day to today or monday
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    if (DAYS_ORDER.includes(today)) {
      setSelectedDay(today);
    } else {
      setSelectedDay('monday');
    }
  }, []);

  const fetchTimetable = async () => {
    try {
      const data = await parentApi.getTimetable();
      setChildrenTimetable(data);
      if (data.length > 0) {
        setSelectedChild(data[0].student_id);
      }
    } catch (error) {
      console.error('Failed to fetch timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubjectColor = (subjectName: string | null) => {
    if (!subjectName) return 'bg-gray-100 border-gray-300';
    const colors: Record<string, string> = {
      'Mathematics': 'bg-blue-50 border-blue-300',
      'Science': 'bg-green-50 border-green-300',
      'English': 'bg-purple-50 border-purple-300',
      'Hindi': 'bg-orange-50 border-orange-300',
      'Social Science': 'bg-yellow-50 border-yellow-300',
      'Computer': 'bg-cyan-50 border-cyan-300',
    };
    return colors[subjectName] || 'bg-gray-50 border-gray-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const currentChildData = childrenTimetable.find(c => c.student_id === selectedChild);
  const currentDayTimetable = currentChildData?.timetable[selectedDay] || [];
  const availableDays = currentChildData
    ? DAYS_ORDER.filter(day => currentChildData.timetable[day]?.length > 0)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Class Timetable</h1>
        <p className="text-gray-600">View your children&apos;s weekly class schedule</p>
      </div>

      {childrenTimetable.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No timetable available</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Child Selector */}
          {childrenTimetable.length > 1 && (
            <div className="flex gap-2">
              {childrenTimetable.map(child => (
                <button
                  key={child.student_id}
                  onClick={() => setSelectedChild(child.student_id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedChild === child.student_id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {child.student_name}
                </button>
              ))}
            </div>
          )}

          {currentChildData && (
            <>
              {/* Student Info */}
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{currentChildData.student_name}</h3>
                      <p className="text-sm text-gray-500">
                        {currentChildData.class_name} - {currentChildData.section}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Day Selector */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {availableDays.map(day => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      selectedDay === day
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {DAY_LABELS[day]}
                  </button>
                ))}
              </div>

              {/* Timetable */}
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                    {DAY_LABELS[selectedDay]} Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentDayTimetable.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No classes scheduled</p>
                  ) : (
                    <div className="space-y-3">
                      {currentDayTimetable
                        .sort((a, b) => a.period - b.period)
                        .map((entry, idx) => (
                          <div
                            key={idx}
                            className={`p-4 rounded-lg border-l-4 ${getSubjectColor(entry.subject_name)}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4">
                                <div className="text-center bg-white rounded-lg p-2 shadow-sm min-w-[60px]">
                                  <p className="text-xs text-gray-500">Period</p>
                                  <p className="text-xl font-bold text-primary-600">{entry.period}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-primary-600" />
                                    {entry.subject_name || 'Free Period'}
                                  </h4>
                                  {entry.teacher_name && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      <Users className="w-3 h-3 inline mr-1" />
                                      {entry.teacher_name}
                                    </p>
                                  )}
                                  {entry.room && (
                                    <p className="text-xs text-gray-500 mt-1">Room: {entry.room}</p>
                                  )}
                                </div>
                              </div>
                              {(entry.start_time || entry.end_time) && (
                                <div className="text-right text-sm text-gray-600">
                                  <Clock className="w-4 h-4 inline mr-1" />
                                  {entry.start_time} - {entry.end_time}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Weekly Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                    Weekly Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr>
                          <th className="text-left py-2 px-3 bg-gray-50 font-medium text-gray-600">Period</th>
                          {availableDays.map(day => (
                            <th key={day} className="text-center py-2 px-3 bg-gray-50 font-medium text-gray-600">
                              {DAY_LABELS[day].slice(0, 3)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 8 }, (_, i) => i + 1).map(period => {
                          const periodEntries = availableDays.map(day =>
                            currentChildData.timetable[day]?.find(e => e.period === period)
                          );
                          // Only show row if at least one day has this period
                          if (periodEntries.every(e => !e)) return null;
                          return (
                            <tr key={period} className="border-b">
                              <td className="py-2 px-3 font-medium text-gray-600">{period}</td>
                              {periodEntries.map((entry, idx) => (
                                <td key={idx} className="py-2 px-3 text-center text-sm">
                                  {entry?.subject_name ? (
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      getSubjectColor(entry.subject_name).replace('bg-', 'bg-').replace('-50', '-100')
                                    }`}>
                                      {entry.subject_name.slice(0, 4)}
                                    </span>
                                  ) : (
                                    <span className="text-gray-300">-</span>
                                  )}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
