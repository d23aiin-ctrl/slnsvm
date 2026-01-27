'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { studentApi } from '@/lib/api';
import { StudentDashboard } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
  BookOpen, Calendar, ClipboardList, CreditCard,
  Bell, TrendingUp, Clock, FileText
} from 'lucide-react';
import { Link } from '@/navigation';

export default function StudentDashboardPage() {
  const [dashboard, setDashboard] = useState<StudentDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await studentApi.getDashboard();
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
    {
      title: 'Attendance',
      value: `${dashboard?.attendance_percentage || 0}%`,
      icon: ClipboardList,
      color: 'bg-green-100 text-green-600',
      link: '/student/attendance',
    },
    {
      title: 'Pending Assignments',
      value: dashboard?.pending_assignments || 0,
      icon: FileText,
      color: 'bg-blue-100 text-blue-600',
      link: '/student/assignments',
    },
    {
      title: 'Upcoming Exams',
      value: dashboard?.upcoming_exams || 0,
      icon: Calendar,
      color: 'bg-purple-100 text-purple-600',
      link: '/student/results',
    },
    {
      title: 'Fee Pending',
      value: formatCurrency(dashboard?.fee_pending || 0),
      icon: CreditCard,
      color: 'bg-red-100 text-red-600',
      link: '/student/fees',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {dashboard?.student?.name || 'Student'}!
        </h1>
        <p className="text-gray-600">
          Class {dashboard?.student?.section} | Roll No: {dashboard?.student?.roll_no}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                {dashboard.recent_notices.map((notice) => (
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

        {/* Quick Links */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/student/timetable">
                <div className="p-4 bg-primary-50 rounded-lg text-center hover:bg-primary-100 transition-colors">
                  <Clock className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <p className="font-medium text-primary-900">View Timetable</p>
                </div>
              </Link>
              <Link href="/student/assignments">
                <div className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors">
                  <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-medium text-blue-900">Assignments</p>
                </div>
              </Link>
              <Link href="/student/results">
                <div className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="font-medium text-green-900">View Results</p>
                </div>
              </Link>
              <Link href="/student/attendance">
                <div className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors">
                  <ClipboardList className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="font-medium text-purple-900">Attendance</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
