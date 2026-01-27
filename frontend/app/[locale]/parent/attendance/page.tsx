'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { UserCheck, CheckCircle, XCircle, Clock, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'late';
  remarks?: string;
}

interface ChildAttendance {
  student_id: number;
  student_name: string;
  class_name: string;
  section: string;
  recent_records: AttendanceRecord[];
  summary: {
    total_days: number;
    present: number;
    absent: number;
    late: number;
    percentage: number;
  };
}

export default function ParentAttendancePage() {
  const [childrenAttendance, setChildrenAttendance] = useState<ChildAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<number | null>(null);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await api.get('/parents/attendance');
      setChildrenAttendance(response.data);
      if (response.data.length > 0) {
        setSelectedChild(response.data[0].student_id);
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'late':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status as keyof typeof colors]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const currentChildData = childrenAttendance.find((c) => c.student_id === selectedChild);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance Report</h1>
        <p className="text-gray-600">Track your children&apos;s attendance</p>
      </div>

      {childrenAttendance.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No attendance data available</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Child Selector */}
          {childrenAttendance.length > 1 && (
            <div className="flex gap-2">
              {childrenAttendance.map((child) => (
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
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary-600">
                        {(currentChildData.summary?.percentage ?? 0).toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-500">Attendance</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">{currentChildData.summary?.present ?? 0}</p>
                      <p className="text-sm text-gray-500">Present</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-600">{currentChildData.summary?.absent ?? 0}</p>
                      <p className="text-sm text-gray-500">Absent</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-yellow-600">{currentChildData.summary?.late ?? 0}</p>
                      <p className="text-sm text-gray-500">Late</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Attendance Records */}
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserCheck className="w-5 h-5 mr-2 text-primary-600" />
                    Recent Attendance - {currentChildData.student_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(!currentChildData.recent_records || currentChildData.recent_records.length === 0) ? (
                      <p className="text-gray-500 text-center py-4">No attendance records</p>
                    ) : (
                      currentChildData.recent_records.slice(0, 30).map((record, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {getStatusIcon(record.status)}
                            <span className="font-medium">{formatDate(record.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {record.remarks && (
                              <span className="text-sm text-gray-500">{record.remarks}</span>
                            )}
                            {getStatusBadge(record.status)}
                          </div>
                        </div>
                      ))
                    )}
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
