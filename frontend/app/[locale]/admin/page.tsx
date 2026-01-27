'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { adminApi } from '@/lib/api';
import { AdminDashboard, Admission } from '@/types';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import {
  Users, GraduationCap, BookOpen, CreditCard,
  ClipboardList, TrendingUp, TrendingDown, Bell
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await adminApi.getDashboard();
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
    { title: 'Total Students', value: dashboard?.total_students || 0, icon: Users, color: 'bg-blue-100 text-blue-600', link: '/admin/students' },
    { title: 'Total Teachers', value: dashboard?.total_teachers || 0, icon: GraduationCap, color: 'bg-green-100 text-green-600', link: '/admin/teachers' },
    { title: 'Total Classes', value: dashboard?.total_classes || 0, icon: BookOpen, color: 'bg-purple-100 text-purple-600', link: '/admin/classes' },
    { title: 'Pending Admissions', value: dashboard?.pending_admissions || 0, icon: ClipboardList, color: 'bg-yellow-100 text-yellow-600', link: '/admin/admissions' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">School management overview</p>
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

      {/* Fee Overview */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-primary-600" />
              Fee Collection Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-green-600">Total Collected</p>
                    <p className="text-2xl font-bold text-green-700">
                      {formatCurrency(dashboard?.total_fee_collected || 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <TrendingDown className="w-8 h-8 text-red-600 mr-3" />
                  <div>
                    <p className="text-sm text-red-600">Pending Amount</p>
                    <p className="text-2xl font-bold text-red-700">
                      {formatCurrency(dashboard?.total_fee_pending || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Link href="/admin/fees">
              <button className="w-full mt-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                View Fee Details
              </button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Admissions */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardList className="w-5 h-5 mr-2 text-primary-600" />
              Recent Admission Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard?.recent_admissions && dashboard.recent_admissions.length > 0 ? (
              <div className="space-y-3">
                {dashboard.recent_admissions.slice(0, 5).map((admission: Admission) => (
                  <div
                    key={admission.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{admission.student_name}</p>
                      <p className="text-sm text-gray-500">
                        Class: {admission.class_applied} | {formatDate(admission.created_at)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(admission.status)}`}>
                      {admission.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent applications</p>
            )}
            <Link href="/admin/admissions">
              <button className="w-full mt-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                View All Applications
              </button>
            </Link>
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
            <Link href="/admin/students">
              <div className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-blue-900">Manage Students</p>
              </div>
            </Link>
            <Link href="/admin/teachers">
              <div className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors">
                <GraduationCap className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-green-900">Manage Teachers</p>
              </div>
            </Link>
            <Link href="/admin/fees">
              <div className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors">
                <CreditCard className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="font-medium text-purple-900">Fee Management</p>
              </div>
            </Link>
            <Link href="/admin/notices">
              <div className="p-4 bg-yellow-50 rounded-lg text-center hover:bg-yellow-100 transition-colors">
                <Bell className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="font-medium text-yellow-900">Manage Notices</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
