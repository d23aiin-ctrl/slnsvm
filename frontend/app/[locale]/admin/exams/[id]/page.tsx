'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { FileSpreadsheet, Plus, Trash2, ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Exam {
  id: number;
  name: string;
  academic_year: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

interface Schedule {
  id: number;
  exam_id: number;
  class_id: number;
  subject_id: number;
  exam_date: string;
  start_time?: string;
  end_time?: string;
  max_marks: number;
  passing_marks?: number;
  room?: string;
  exam_name?: string;
  class_name?: string;
  subject_name?: string;
}

interface ClassInfo {
  id: number;
  name: string;
  section?: string;
}

interface Subject {
  id: number;
  name: string;
  code: string;
}

export default function ExamDetailPage() {
  const params = useParams();
  const examId = Number(params.id);

  const [exam, setExam] = useState<Exam | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    class_id: '',
    subject_id: '',
    exam_date: '',
    start_time: '',
    end_time: '',
    max_marks: '100',
    passing_marks: '35',
    room: ''
  });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [examData, schedulesData, classesData, subjectsData] = await Promise.all([
        adminApi.getExam(examId),
        adminApi.getExamSchedules(examId),
        adminApi.getClasses(),
        adminApi.getSubjects()
      ]);
      setExam(examData);
      setSchedules(schedulesData);
      setClasses(classesData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.createExamSchedule(examId, {
        exam_id: examId,
        class_id: Number(formData.class_id),
        subject_id: Number(formData.subject_id),
        exam_date: formData.exam_date,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        max_marks: Number(formData.max_marks),
        passing_marks: formData.passing_marks ? Number(formData.passing_marks) : null,
        room: formData.room || null
      });
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to add schedule');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (scheduleId: number) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    try {
      await adminApi.deleteExamSchedule(scheduleId);
      fetchData();
    } catch (error) {
      alert('Failed to delete schedule');
    }
  };

  const resetForm = () => {
    setFormData({
      class_id: '',
      subject_id: '',
      exam_date: '',
      start_time: '',
      end_time: '',
      max_marks: '100',
      passing_marks: '35',
      room: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Exam not found</p>
        <Link href="/admin/exams">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Exams
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin/exams">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{exam.name}</h1>
            <p className="text-gray-600">
              {exam.academic_year}
              {exam.start_date && ` | ${formatDate(exam.start_date)}`}
              {exam.end_date && ` - ${formatDate(exam.end_date)}`}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href={`/admin/exams/${examId}/results`}>
            <Button variant="outline">
              Manage Results
            </Button>
          </Link>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Schedule
          </Button>
        </div>
      </div>

      {exam.description && (
        <Card>
          <CardContent className="p-4">
            <p className="text-gray-700">{exam.description}</p>
          </CardContent>
        </Card>
      )}

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-primary-600" />
            Exam Schedule ({schedules.length} subjects)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {schedules.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Max Marks</TableHead>
                  <TableHead>Passing</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell className="font-medium">{formatDate(schedule.exam_date)}</TableCell>
                    <TableCell>{schedule.class_name}</TableCell>
                    <TableCell>{schedule.subject_name}</TableCell>
                    <TableCell>
                      {schedule.start_time && schedule.end_time
                        ? `${schedule.start_time} - ${schedule.end_time}`
                        : '-'}
                    </TableCell>
                    <TableCell>{schedule.max_marks}</TableCell>
                    <TableCell>{schedule.passing_marks || '-'}</TableCell>
                    <TableCell>{schedule.room || '-'}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleDelete(schedule.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No schedule added yet</p>
              <Button variant="outline" className="mt-4" onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add first schedule
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Schedule Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add Exam Schedule"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.class_id}
                onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                required
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name} {cls.section || ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.subject_id}
                onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                required
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date</label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.exam_date}
                onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Room 101"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks</label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.max_marks}
                onChange={(e) => setFormData({ ...formData, max_marks: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passing Marks</label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.passing_marks}
                onChange={(e) => setFormData({ ...formData, passing_marks: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              Add Schedule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
