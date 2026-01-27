'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  BarChart3, Users, GraduationCap, IndianRupee, UserCheck,
  Download, FileSpreadsheet, TrendingUp, TrendingDown
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface DashboardStats {
  total_students: number;
  total_teachers: number;
  total_classes: number;
  total_fees_collected: number;
  total_fees_pending: number;
  attendance_percentage: number;
  new_admissions: number;
}

export default function AdminReportsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (reportType: string, format: 'csv' | 'xlsx') => {
    setExporting(reportType);
    try {
      const response = await api.get(`/bulk/export/${reportType}?format=${format}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: format === 'xlsx'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export report');
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const reports = [
    {
      title: 'Student Report',
      description: 'Complete list of all students with their details',
      icon: Users,
      color: 'blue',
      type: 'students',
    },
    {
      title: 'Teacher Report',
      description: 'List of all teachers with qualifications',
      icon: GraduationCap,
      color: 'purple',
      type: 'teachers',
    },
    {
      title: 'Fee Report',
      description: 'Fee collection status and pending dues',
      icon: IndianRupee,
      color: 'green',
      type: 'fees',
    },
    {
      title: 'Attendance Report',
      description: 'Student attendance records and statistics',
      icon: UserCheck,
      color: 'orange',
      type: 'attendance',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600">Generate and download various reports</p>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.total_students}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Teachers</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.total_teachers}</p>
                </div>
                <GraduationCap className="w-8 h-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Fees Collected</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.total_fees_collected)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Fees Pending</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.total_fees_pending)}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <Card key={report.type} variant="elevated">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg bg-${report.color}-100`}>
                  <report.icon className={`w-6 h-6 text-${report.color}-600`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{report.description}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExport(report.type, 'csv')}
                      isLoading={exporting === report.type}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      CSV
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExport(report.type, 'xlsx')}
                      isLoading={exporting === report.type}
                    >
                      <FileSpreadsheet className="w-4 h-4 mr-1" />
                      Excel
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-primary-600" />
            Report Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-gray-600">
            <p>
              <strong>Student Report:</strong> Includes admission number, name, class, section, contact details, and parent information.
            </p>
            <p>
              <strong>Teacher Report:</strong> Includes employee ID, name, qualification, experience, and assigned classes.
            </p>
            <p>
              <strong>Fee Report:</strong> Includes student details, fee type, amount, due date, payment status, and transaction details.
            </p>
            <p>
              <strong>Attendance Report:</strong> Includes date-wise attendance records for all students with present/absent/late status.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
