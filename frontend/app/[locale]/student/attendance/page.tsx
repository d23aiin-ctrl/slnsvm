'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { studentApi } from '@/lib/api';
import { AttendanceSummary } from '@/types';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const data = await studentApi.getAttendance();
        setAttendance(data);
      } catch (error) {
        console.error('Failed to fetch attendance:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Days', value: attendance?.total_days || 0, icon: Clock, color: 'bg-gray-100 text-gray-600' },
    { label: 'Present', value: attendance?.present || 0, icon: CheckCircle, color: 'bg-green-100 text-green-600' },
    { label: 'Absent', value: attendance?.absent || 0, icon: XCircle, color: 'bg-red-100 text-red-600' },
    { label: 'Late', value: attendance?.late || 0, icon: AlertCircle, color: 'bg-yellow-100 text-yellow-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
        <p className="text-gray-600">Track your attendance record</p>
      </div>

      {/* Overall Percentage */}
      <Card variant="elevated" className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 mb-1">Overall Attendance</p>
              <p className="text-5xl font-bold">{attendance?.percentage || 0}%</p>
            </div>
            <div className="w-32 h-32 relative">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="white"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(attendance?.percentage || 0) * 3.52} 352`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} variant="elevated">
            <CardContent className="flex items-center">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Attendance Requirement */}
      <Card variant="bordered">
        <CardContent>
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Minimum Attendance Requirement</p>
              <p className="text-sm text-gray-600 mt-1">
                As per CBSE guidelines, a minimum of 75% attendance is required to appear for examinations.
                {(attendance?.percentage || 0) < 75 && (
                  <span className="text-red-600 font-medium"> Your current attendance is below the required threshold.</span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
