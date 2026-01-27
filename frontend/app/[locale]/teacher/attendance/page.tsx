'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { teacherApi } from '@/lib/api';
import { ClassInfo } from '@/types';
import { ClipboardList, Check, X, Clock } from 'lucide-react';

interface AttendanceRecord {
  student_id: number;
  status: 'present' | 'absent' | 'late';
  remarks?: string;
}

export default function TeacherAttendancePage() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<any>(null);
  const [records, setRecords] = useState<Record<number, AttendanceRecord>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchClasses = useCallback(async () => {
    try {
      const data = await teacherApi.getClasses();
      setClasses(data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAttendance = useCallback(async () => {
    try {
      const data = await teacherApi.getClassAttendance(selectedClass!, selectedDate);
      setAttendance(data);
      const initialRecords: Record<number, AttendanceRecord> = {};
      data.records.forEach((r: any) => {
        initialRecords[r.student_id] = {
          student_id: r.student_id,
          status: r.status,
          remarks: r.remarks,
        };
      });
      setRecords(initialRecords);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      setAttendance(null);
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

  const handleStatusChange = (studentId: number, status: 'present' | 'absent' | 'late') => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], student_id: studentId, status },
    }));
  };

  const handleSave = async () => {
    if (!selectedClass) return;
    setSaving(true);
    try {
      await teacherApi.markAttendance({
        date: selectedDate,
        class_id: selectedClass,
        records: Object.values(records),
      });
      alert('Attendance saved successfully!');
    } catch (error) {
      alert('Failed to save attendance');
    } finally {
      setSaving(false);
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
        <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
        <p className="text-gray-600">Record daily attendance for your classes</p>
      </div>

      {/* Filters */}
      <Card variant="elevated">
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={selectedClass || ''}
                onChange={(e) => setSelectedClass(Number(e.target.value))}
              >
                <option value="">Select a class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} - {cls.section} ({cls.total_students} students)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSave} isLoading={saving} disabled={!selectedClass}>
                Save Attendance
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance List */}
      {attendance && (
        <Card variant="elevated">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <ClipboardList className="w-5 h-5 mr-2 text-primary-600" />
                {attendance.class_name} - {selectedDate}
              </CardTitle>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">Present: {attendance.present}</span>
                <span className="text-red-600">Absent: {attendance.absent}</span>
                <span className="text-yellow-600">Late: {attendance.late}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Roll No</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Student Name</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attendance.records.map((student: any) => (
                    <tr key={student.student_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">{student.roll_no}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium">{student.student_name}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleStatusChange(student.student_id, 'present')}
                            className={`p-2 rounded-lg transition-colors ${
                              records[student.student_id]?.status === 'present'
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 text-gray-500 hover:bg-green-100'
                            }`}
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(student.student_id, 'absent')}
                            className={`p-2 rounded-lg transition-colors ${
                              records[student.student_id]?.status === 'absent'
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-100 text-gray-500 hover:bg-red-100'
                            }`}
                          >
                            <X className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(student.student_id, 'late')}
                            className={`p-2 rounded-lg transition-colors ${
                              records[student.student_id]?.status === 'late'
                                ? 'bg-yellow-500 text-white'
                                : 'bg-gray-100 text-gray-500 hover:bg-yellow-100'
                            }`}
                          >
                            <Clock className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedClass && (
        <Card variant="bordered">
          <CardContent className="text-center py-12">
            <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Select a class to mark attendance</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
