'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { studentApi } from '@/lib/api';
import { TimetableEntry } from '@/types';
import { Calendar } from 'lucide-react';

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export default function TimetablePage() {
  const [timetable, setTimetable] = useState<{ entries: TimetableEntry[]; class_name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const data = await studentApi.getTimetable();
        setTimetable(data);
      } catch (error) {
        console.error('Failed to fetch timetable:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const getEntriesForDay = (day: string) => {
    return timetable?.entries?.filter(e => e.day.toLowerCase() === day).sort((a, b) => a.period - b.period) || [];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Timetable</h1>
          <p className="text-gray-600">{timetable?.class_name}</p>
        </div>
        <div className="flex items-center text-primary-600">
          <Calendar className="w-5 h-5 mr-2" />
          <span>Academic Year 2024-25</span>
        </div>
      </div>

      <Card variant="elevated">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Period</th>
                {days.map((day) => (
                  <th key={day} className="px-4 py-3 text-left text-sm font-semibold text-gray-900 capitalize">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((period) => (
                <tr key={period} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">Period {period}</div>
                    <div className="text-xs text-gray-500">
                      {period <= 4 ? `${8 + period - 1}:00 - ${8 + period}:00` : `${8 + period}:00 - ${9 + period}:00`}
                    </div>
                  </td>
                  {days.map((day) => {
                    const entry = getEntriesForDay(day).find(e => e.period === period);
                    return (
                      <td key={day} className="px-4 py-3">
                        {entry ? (
                          <div className="bg-primary-50 rounded-lg p-2">
                            <p className="font-medium text-primary-900">{entry.subject_name || '-'}</p>
                            <p className="text-xs text-primary-700">{entry.teacher_name || '-'}</p>
                            {entry.room && <p className="text-xs text-gray-500">Room: {entry.room}</p>}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
