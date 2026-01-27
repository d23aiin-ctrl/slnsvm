'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { parentApi } from '@/lib/api';
import { ParentDashboard, ChildInfo } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Users, CreditCard, Bell, TrendingUp, UserCheck } from 'lucide-react';

export default function ParentDashboardPage() {
  const [dashboard, setDashboard] = useState<ParentDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await parentApi.getDashboard();
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {dashboard?.parent?.name || 'Parent'}!
        </h1>
        <p className="text-gray-600">Monitor your children&apos;s progress and manage fees</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="elevated">
          <CardContent className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Children</p>
              <p className="text-2xl font-bold text-gray-900">{dashboard?.children?.length || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Link href="/parent/fees">
          <Card variant="elevated" className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                <CreditCard className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Fee Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dashboard?.total_fee_pending || 0)}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card variant="elevated">
          <CardContent className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <Bell className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">New Notices</p>
              <p className="text-2xl font-bold text-gray-900">{dashboard?.recent_notices?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Children Overview */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-primary-600" />
            My Children
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dashboard?.children && dashboard.children.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {dashboard.children.map((child: ChildInfo) => (
                <div key={child.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{child.name}</h3>
                      <p className="text-sm text-gray-600">
                        {child.class_name} - {child.section} | Roll No: {child.roll_no}
                      </p>
                      <p className="text-xs text-gray-500">Admission No: {child.admission_no}</p>
                    </div>
                    <Badge variant={child.fee_status === 'paid' ? 'success' : 'warning'}>
                      Fee: {child.fee_status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <UserCheck className="w-4 h-4 text-gray-500 mr-1" />
                      <span className="text-sm text-gray-600">
                        Attendance: {child.attendance_percentage}%
                      </span>
                    </div>
                    <div className={`w-16 h-2 rounded-full ${
                      child.attendance_percentage >= 75 ? 'bg-green-500' : 'bg-red-500'
                    }`} style={{ width: `${child.attendance_percentage}%`, maxWidth: '4rem' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No children linked to your account</p>
          )}
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
