'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FileSpreadsheet, Calendar, Clock, MapPin, BookOpen } from 'lucide-react';
import { studentApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface ExamSchedule {
  id: number;
  subject_name: string | null;
  exam_date: string | null;
  start_time: string | null;
  end_time: string | null;
  room: string | null;
  max_marks: number | null;
}

interface Exam {
  exam_id: number;
  exam_name: string;
  academic_year: string;
  schedules: ExamSchedule[];
}

export default function StudentExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExamSchedule();
  }, []);

  const fetchExamSchedule = async () => {
    try {
      const data = await studentApi.getExamSchedule();
      setExams(data);
    } catch (error) {
      console.error('Failed to fetch exam schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntil = (dateString: string) => {
    const examDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);
    const diff = examDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getDateBadge = (dateString: string) => {
    const days = getDaysUntil(dateString);
    if (days === 0) {
      return <Badge variant="danger">Today</Badge>;
    } else if (days === 1) {
      return <Badge variant="warning">Tomorrow</Badge>;
    } else if (days <= 7) {
      return <Badge variant="info">{days} days</Badge>;
    }
    return null;
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
        <h1 className="text-2xl font-bold text-gray-900">Exam Schedule</h1>
        <p className="text-gray-600">View your upcoming examination schedule</p>
      </div>

      {exams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No upcoming exams scheduled</p>
            <p className="text-sm text-gray-400 mt-1">Check back later for exam announcements</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {exams.map((exam) => (
            <Card key={exam.exam_id} variant="elevated">
              <CardHeader className="border-b bg-gray-50">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileSpreadsheet className="w-5 h-5 mr-2 text-primary-600" />
                    {exam.exam_name}
                  </div>
                  <Badge variant="default">{exam.academic_year}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {exam.schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-primary-100 rounded-lg">
                            <BookOpen className="w-6 h-6 text-primary-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900">
                                {schedule.subject_name || 'Subject TBD'}
                              </h4>
                              {schedule.exam_date && getDateBadge(schedule.exam_date)}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                              {schedule.exam_date && (
                                <span className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {formatDate(schedule.exam_date)}
                                </span>
                              )}
                              {(schedule.start_time || schedule.end_time) && (
                                <span className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {schedule.start_time} - {schedule.end_time}
                                </span>
                              )}
                              {schedule.room && (
                                <span className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  Room: {schedule.room}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          {schedule.max_marks && (
                            <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              Max Marks: {schedule.max_marks}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Exam Tips */}
      <Card variant="bordered" className="border-blue-200 bg-blue-50">
        <CardContent className="py-4">
          <h4 className="font-medium text-blue-800 mb-2">Exam Preparation Tips</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>Review your notes and textbooks thoroughly</li>
            <li>Practice previous year question papers</li>
            <li>Get adequate sleep before the exam day</li>
            <li>Arrive at the exam hall at least 15 minutes early</li>
            <li>Bring all required stationery and admit card</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
