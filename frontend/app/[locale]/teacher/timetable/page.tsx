'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { teacherApi } from '@/lib/api';
import { Clock, Calendar } from 'lucide-react';

interface TimetableEntry {
  id: number;
  day: string;
  period: number;
  start_time?: string;
  end_time?: string;
  class_id: number;
  class_name?: string;
  subject_name?: string;
  room?: string;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];
const DAY_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday'
};

export default function TeacherTimetablePage() {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const data = await teacherApi.getTimetable();
      setTimetable(data);
    } catch (error) {
      console.error('Failed to fetch timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEntryForSlot = (day: string, period: number): TimetableEntry | undefined => {
    return timetable.find(e => e.day === day && e.period === period);
  };

  const getTodayDay = (): string => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  };

  const todayDay = getTodayDay();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Timetable</h1>
        <p className="text-gray-600">Your weekly teaching schedule</p>
      </div>

      {/* Today's Classes Summary */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-primary-600" />
            Today&apos;s Classes ({DAY_LABELS[todayDay] || 'Sunday'})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayDay === 'sunday' ? (
            <p className="text-gray-500 text-center py-4">No classes on Sunday</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {timetable
                .filter(e => e.day === todayDay)
                .sort((a, b) => a.period - b.period)
                .map(entry => (
                  <div key={entry.id} className="bg-primary-50 rounded-lg p-3 min-w-[150px]">
                    <p className="text-xs text-primary-600 font-medium">Period {entry.period}</p>
                    <p className="font-semibold text-gray-900">{entry.subject_name}</p>
                    <p className="text-sm text-gray-600">{entry.class_name}</p>
                    {entry.start_time && (
                      <p className="text-xs text-gray-500 mt-1">
                        {entry.start_time} - {entry.end_time}
                      </p>
                    )}
                    {entry.room && (
                      <p className="text-xs text-gray-400">Room: {entry.room}</p>
                    )}
                  </div>
                ))}
              {timetable.filter(e => e.day === todayDay).length === 0 && (
                <p className="text-gray-500">No classes scheduled for today</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Weekly Timetable */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-primary-600" />
            Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th className="border border-gray-200 bg-gray-50 p-2 text-center font-medium text-gray-700 w-20">
                    Period
                  </th>
                  {DAYS.map(day => (
                    <th
                      key={day}
                      className={`border border-gray-200 p-2 text-center font-medium ${
                        day === todayDay ? 'bg-primary-50 text-primary-700' : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      {DAY_LABELS[day]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map(period => (
                  <tr key={period}>
                    <td className="border border-gray-200 bg-gray-50 p-2 text-center font-medium text-gray-700">
                      {period}
                    </td>
                    {DAYS.map(day => {
                      const entry = getEntryForSlot(day, period);
                      const isToday = day === todayDay;
                      return (
                        <td
                          key={`${day}-${period}`}
                          className={`border border-gray-200 p-1 min-w-[120px] h-20 align-top ${
                            isToday ? 'bg-primary-50/30' : ''
                          }`}
                        >
                          {entry ? (
                            <div className={`rounded p-2 h-full ${isToday ? 'bg-primary-100' : 'bg-blue-50'}`}>
                              <p className={`font-medium text-sm ${isToday ? 'text-primary-700' : 'text-blue-700'}`}>
                                {entry.subject_name || 'Class'}
                              </p>
                              <p className="text-xs text-gray-600">{entry.class_name}</p>
                              {entry.room && (
                                <p className="text-xs text-gray-500">Room: {entry.room}</p>
                              )}
                              {entry.start_time && (
                                <p className="text-xs text-gray-400 mt-1">
                                  {entry.start_time} - {entry.end_time}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center text-gray-300 text-sm">
                              -
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Classes/Week</p>
            <p className="text-2xl font-bold text-gray-900">{timetable.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Unique Classes</p>
            <p className="text-2xl font-bold text-gray-900">
              {new Set(timetable.map(e => e.class_id)).size}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Unique Subjects</p>
            <p className="text-2xl font-bold text-gray-900">
              {new Set(timetable.map(e => e.subject_name).filter(Boolean)).size}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
