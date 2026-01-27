'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { adminApi } from '@/lib/api';
import { Clock, Plus, Pencil, Trash2 } from 'lucide-react';

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

interface Teacher {
  id: number;
  name: string;
}

interface TimetableEntry {
  id: number;
  day: string;
  period: number;
  start_time?: string;
  end_time?: string;
  subject_name?: string;
  teacher_name?: string;
  room?: string;
}

interface TimetableData {
  class_id: number;
  class_name: string;
  entries: TimetableEntry[];
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];
const DAY_LABELS: Record<string, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat'
};

export default function AdminTimetablePage() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [timetableData, setTimetableData] = useState<TimetableData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [formData, setFormData] = useState({
    day: 'monday',
    period: 1,
    start_time: '',
    end_time: '',
    subject_id: '',
    teacher_id: '',
    room: ''
  });
  const [saving, setSaving] = useState(false);

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

  const fetchSubjects = useCallback(async () => {
    try {
      const data = await adminApi.getSubjects();
      setSubjects(data);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  }, []);

  const fetchTeachers = useCallback(async () => {
    try {
      const data = await adminApi.getTeachers();
      setTeachers(data);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    }
  }, []);

  const fetchTimetable = useCallback(async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      const data = await adminApi.getClassTimetable(selectedClass);
      setTimetableData(data);
    } catch (error) {
      console.error('Failed to fetch timetable:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedClass]);

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
    fetchTeachers();
  }, [fetchClasses, fetchSubjects, fetchTeachers]);

  useEffect(() => {
    if (selectedClass) {
      fetchTimetable();
    }
  }, [fetchTimetable, selectedClass]);

  const getEntryForSlot = (day: string, period: number): TimetableEntry | undefined => {
    return timetableData?.entries.find(e => e.day === day && e.period === period);
  };

  const openAddModal = (day: string, period: number) => {
    setEditingEntry(null);
    setFormData({
      day,
      period,
      start_time: '',
      end_time: '',
      subject_id: '',
      teacher_id: '',
      room: ''
    });
    setShowModal(true);
  };

  const openEditModal = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    const subject = subjects.find(s => s.name === entry.subject_name);
    const teacher = teachers.find(t => t.name === entry.teacher_name);
    setFormData({
      day: entry.day,
      period: entry.period,
      start_time: entry.start_time || '',
      end_time: entry.end_time || '',
      subject_id: subject?.id.toString() || '',
      teacher_id: teacher?.id.toString() || '',
      room: entry.room || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;
    setSaving(true);
    try {
      const data = {
        class_id: selectedClass,
        day: formData.day,
        period: formData.period,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        subject_id: formData.subject_id ? Number(formData.subject_id) : null,
        teacher_id: formData.teacher_id ? Number(formData.teacher_id) : null,
        room: formData.room || null
      };

      if (editingEntry) {
        await adminApi.updateTimetableEntry(editingEntry.id, data);
      } else {
        await adminApi.createTimetableEntry(data);
      }

      setShowModal(false);
      fetchTimetable();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to save timetable entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (entryId: number) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      await adminApi.deleteTimetableEntry(entryId);
      fetchTimetable();
    } catch (error) {
      alert('Failed to delete entry');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timetable Management</h1>
          <p className="text-gray-600">Manage class timetables</p>
        </div>
      </div>

      {/* Class Selector */}
      <Card variant="elevated">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Select Class:</label>
            <select
              className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
        </CardContent>
      </Card>

      {/* Timetable Grid */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-primary-600" />
            {timetableData ? timetableData.class_name : 'Weekly Timetable'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : selectedClass ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-200 bg-gray-50 p-2 text-center font-medium text-gray-700 w-20">
                      Period
                    </th>
                    {DAYS.map(day => (
                      <th key={day} className="border border-gray-200 bg-gray-50 p-2 text-center font-medium text-gray-700">
                        {DAY_LABELS[day]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERIODS.map(period => (
                    <tr key={period}>
                      <td className="border border-gray-200 bg-gray-50 p-2 text-center font-medium text-gray-700">
                        {period}
                      </td>
                      {DAYS.map(day => {
                        const entry = getEntryForSlot(day, period);
                        return (
                          <td key={`${day}-${period}`} className="border border-gray-200 p-1 min-w-[120px] h-20 align-top">
                            {entry ? (
                              <div className="bg-primary-50 rounded p-2 h-full relative group">
                                <p className="font-medium text-primary-700 text-sm">
                                  {entry.subject_name || 'No Subject'}
                                </p>
                                <p className="text-xs text-gray-600">{entry.teacher_name || '-'}</p>
                                {entry.room && (
                                  <p className="text-xs text-gray-500">Room: {entry.room}</p>
                                )}
                                {entry.start_time && (
                                  <p className="text-xs text-gray-400">
                                    {entry.start_time} - {entry.end_time}
                                  </p>
                                )}
                                <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                                  <button
                                    onClick={() => openEditModal(entry)}
                                    className="p-1 bg-white rounded shadow hover:bg-gray-50"
                                  >
                                    <Pencil className="w-3 h-3 text-blue-600" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(entry.id)}
                                    className="p-1 bg-white rounded shadow hover:bg-gray-50"
                                  >
                                    <Trash2 className="w-3 h-3 text-red-600" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => openAddModal(day, period)}
                                className="w-full h-full flex items-center justify-center text-gray-400 hover:bg-gray-50 rounded"
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Select a class to view/edit timetable</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingEntry ? 'Edit Timetable Entry' : 'Add Timetable Entry'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                disabled={!!editingEntry}
              >
                {DAYS.map(day => (
                  <option key={day} value={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: Number(e.target.value) })}
                disabled={!!editingEntry}
              >
                {PERIODS.map(p => (
                  <option key={p} value={p}>Period {p}</option>
                ))}
              </select>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.subject_id}
                onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.teacher_id}
                onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
              >
                <option value="">Select Teacher</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                ))}
              </select>
            </div>
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
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              {editingEntry ? 'Update' : 'Add'} Entry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
