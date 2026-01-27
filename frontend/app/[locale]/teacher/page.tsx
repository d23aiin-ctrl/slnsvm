'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { teacherApi } from '@/lib/api';
import { TeacherDashboard, ClassInfo, ScheduleEntry } from '@/types';
import { Users, FileText, ClipboardList, Bell, Clock, BookOpen, MessageSquare } from 'lucide-react';

export default function TeacherDashboardPage() {
  const [dashboard, setDashboard] = useState<TeacherDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await teacherApi.getDashboard();
        setDashboard(data);
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const stats = [
    { title: 'My Classes', value: dashboard?.classes?.length || 0, icon: BookOpen, color: 'bg-blue-100 text-blue-600', link: '/teacher/classes' },
    { title: 'Total Students', value: dashboard?.total_students || 0, icon: Users, color: 'bg-green-100 text-green-600', link: '/teacher/classes' },
    { title: 'Pending Grades', value: dashboard?.pending_assignments_to_grade || 0, icon: FileText, color: 'bg-yellow-100 text-yellow-600', link: '/teacher/assignments' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {dashboard?.teacher?.name || 'Teacher'}!
        </h1>
        <p className="text-gray-600">Employee ID: {dashboard?.teacher?.employee_id}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Link href={stat.link} key={stat.title}>
            <Card variant="elevated" className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="flex items-center">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary-600" />
              Today&apos;s Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard?.today_schedule && dashboard.today_schedule.length > 0 ? (
              <div className="space-y-3">
                {dashboard.today_schedule.map((entry: ScheduleEntry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-primary-600 font-semibold">{entry.period}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{entry.subject}</p>
                        <p className="text-sm text-gray-500">{entry.class}</p>
                      </div>
                    </div>
                    {entry.room && (
                      <span className="text-sm text-gray-500">Room: {entry.room}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No classes scheduled for today</p>
            )}
          </CardContent>
        </Card>

        {/* My Classes */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-primary-600" />
              My Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard?.classes && dashboard.classes.length > 0 ? (
              <div className="space-y-3">
                {dashboard.classes.map((cls: ClassInfo) => (
                  <div
                    key={cls.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {cls.name} - {cls.section}
                      </p>
                      <p className="text-sm text-gray-500">{cls.total_students} students</p>
                    </div>
                    <Link href={`/teacher/classes/${cls.id}`}>
                      <Badge variant="info">View</Badge>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No classes assigned</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/teacher/attendance">
              <div className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors">
                <ClipboardList className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-green-900">Mark Attendance</p>
              </div>
            </Link>
            <Link href="/teacher/assignments">
              <div className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors">
                <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-blue-900">Create Assignment</p>
              </div>
            </Link>
            <Link href="/teacher/marks">
              <div className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors">
                <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="font-medium text-purple-900">Enter Marks</p>
              </div>
            </Link>
            <Link href="/teacher/ai">
              <div className="p-4 bg-yellow-50 rounded-lg text-center hover:bg-yellow-100 transition-colors">
                <MessageSquare className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="font-medium text-yellow-900">AI Assistant</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Notices */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2 text-primary-600" />
            Recent Notices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dashboard?.recent_notices && dashboard.recent_notices.length > 0 ? (
            <div className="space-y-3">
              {dashboard.recent_notices.map((notice: any) => (
                <div
                  key={notice.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-gray-900">{notice.title}</span>
                  <Badge variant={notice.priority === 'high' ? 'danger' : 'default'}>
                    {notice.priority}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent notices</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
