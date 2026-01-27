'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, BookOpen, Clock, MapPin } from 'lucide-react';
import { api } from '@/lib/api';

interface ClassInfo {
  id: number;
  name: string;
  section: string;
  academic_year: string;
  room_number?: string;
  student_count: number;
  subjects: string[];
}

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/teachers/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
        <p className="text-gray-600">View and manage your assigned classes</p>
      </div>

      {classes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No classes assigned yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classInfo) => (
            <Card key={classInfo.id} variant="elevated" className="hover:shadow-lg transition-shadow">
              <CardHeader className="bg-primary-50 rounded-t-lg">
                <CardTitle className="flex items-center justify-between">
                  <span>{classInfo.name} - {classInfo.section}</span>
                  <span className="text-sm font-normal text-gray-500">{classInfo.academic_year}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{classInfo.student_count} Students</span>
                  </div>
                  {classInfo.room_number && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{classInfo.room_number}</span>
                    </div>
                  )}
                  {classInfo.subjects.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Subjects:</p>
                      <div className="flex flex-wrap gap-2">
                        {classInfo.subjects.map((subject, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
