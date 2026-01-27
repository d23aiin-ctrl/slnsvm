'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { adminApi } from '@/lib/api';
import { UserCheck, Calendar, Users, CheckCircle, XCircle, Clock, Save } from 'lucide-react';

interface ClassInfo {
  id: number;
  name: string;
  section?: string;
  student_count: number;
}

interface AttendanceRecord {
  student_id: number;
  student_name: string;
  roll_no?: number;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
}

interface ClassAttendanceData {
  date: string;
  class_id: number;
  class_name: string;
  total_students: number;
  present: number;
  absent: number;
  late: number;
  records: AttendanceRecord[];
}

export default function AdminAttendancePage() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<ClassAttendanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  const fetchClasses = useCallback(async () => {
    try {
      const data = await adminApi.getClasses();
      setClasses(data);
      if (data.length > 0) {
        setSelectedClass(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  }, []);

  const fetchAttendance = useCallback(async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      const data = await adminApi.getClassAttendance(selectedClass, selectedDate);
      setAttendanceData(data);
      setRecords(data.records);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedDate]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      fetchAttendance();
    }
  }, [fetchAttendance, selectedClass, selectedDate]);

  const updateRecord = (studentId: number, field: string, value: string) => {
    setRecords(prev => prev.map(record =>
      record.student_id === studentId
        ? { ...record, [field]: value }
        : record
    ));
  };

  const handleSave = async () => {
    if (!selectedClass) return;
    setSaving(true);
    try {
      await adminApi.markBulkAttendance({
        date: selectedDate,
        class_id: selectedClass,
        records: records.map(r => ({
          student_id: r.student_id,
          status: r.status,
          remarks: r.remarks || ''
        }))
      });
      alert('Attendance saved successfully!');
      fetchAttendance();
    } catch (error) {
      alert('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const markAllAs = (status: 'present' | 'absent' | 'late') => {
    setRecords(prev => prev.map(record => ({ ...record, status })));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'excused': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const presentCount = records.filter(r => r.status === 'present').length;
  const absentCount = records.filter(r => r.status === 'absent').length;
  const lateCount = records.filter(r => r.status === 'late').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600">Mark and manage student attendance</p>
        </div>
      </div>

      {/* Filters */}
      <Card variant="elevated">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
              <select
                className="w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={selectedClass || ''}
                onChange={(e) => setSelectedClass(Number(e.target.value))}
              >
                <option value="">Select a class</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} {cls.section || ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
              <input
                type="date"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => markAllAs('present')}>
                <CheckCircle className="w-4 h-4 mr-1" />
                Mark All Present
              </Button>
              <Button variant="outline" size="sm" onClick={() => markAllAs('absent')}>
                <XCircle className="w-4 h-4 mr-1" />
                Mark All Absent
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {records.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{records.length}</p>
                </div>
                <Users className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Present</p>
                  <p className="text-2xl font-bold text-green-600">{presentCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Absent</p>
                  <p className="text-2xl font-bold text-red-600">{absentCount}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Late</p>
                  <p className="text-2xl font-bold text-yellow-600">{lateCount}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance Table */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <UserCheck className="w-5 h-5 mr-2 text-primary-600" />
              {attendanceData ? `${attendanceData.class_name} - ${selectedDate}` : 'Attendance Records'}
            </CardTitle>
            {records.length > 0 && (
              <Button onClick={handleSave} isLoading={saving}>
                <Save className="w-4 h-4 mr-2" />
                Save Attendance
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : records.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.student_id}>
                    <TableCell className="font-medium">{record.roll_no || '-'}</TableCell>
                    <TableCell>{record.student_name}</TableCell>
                    <TableCell>
                      <select
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(record.status)}`}
                        value={record.status}
                        onChange={(e) => updateRecord(record.student_id, 'status', e.target.value)}
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="excused">Excused</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      <input
                        type="text"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Add remarks..."
                        value={record.remarks || ''}
                        onChange={(e) => updateRecord(record.student_id, 'remarks', e.target.value)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Select a class and date to view/mark attendance</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
