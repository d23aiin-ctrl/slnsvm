'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { adminApi } from '@/lib/api';
import { BookOpen, Plus, Pencil, Trash2, Users } from 'lucide-react';

interface ClassInfo {
  id: number;
  name: string;
  section: string;
  academic_year: string;
  room_number?: string;
  class_teacher_id?: number;
  class_teacher_name?: string;
  student_count?: number;
}

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassInfo | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    academic_year: '2024-25',
    room_number: '',
    class_teacher_id: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const data = await adminApi.getClasses();
      setClasses(data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        class_teacher_id: formData.class_teacher_id ? parseInt(formData.class_teacher_id) : null,
      };
      await adminApi.createClass(payload);
      fetchClasses();
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      alert('Failed to save class');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      section: '',
      academic_year: '2024-25',
      room_number: '',
      class_teacher_id: '',
    });
  };

  const openEditModal = (classInfo: ClassInfo) => {
    setEditingClass(classInfo);
    setFormData({
      name: classInfo.name,
      section: classInfo.section,
      academic_year: classInfo.academic_year,
      room_number: classInfo.room_number || '',
      class_teacher_id: classInfo.class_teacher_id?.toString() || '',
    });
    setShowAddModal(true);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Management</h1>
          <p className="text-gray-600">Manage school classes and sections</p>
        </div>
        <Button onClick={() => { resetForm(); setEditingClass(null); setShowAddModal(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Class
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Classes</p>
                <p className="text-2xl font-bold text-primary-600">{classes.length}</p>
              </div>
              <BookOpen className="w-10 h-10 text-primary-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-green-600">
                  {classes.reduce((sum, c) => sum + (c.student_count || 0), 0)}
                </p>
              </div>
              <Users className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Academic Year</p>
                <p className="text-2xl font-bold text-blue-600">2024-25</p>
              </div>
              <BookOpen className="w-10 h-10 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-primary-600" />
            All Classes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Academic Year</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Class Teacher</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((classInfo) => (
                <TableRow key={classInfo.id}>
                  <TableCell className="font-medium">{classInfo.name}</TableCell>
                  <TableCell>{classInfo.section}</TableCell>
                  <TableCell>{classInfo.academic_year}</TableCell>
                  <TableCell>{classInfo.room_number || '-'}</TableCell>
                  <TableCell>{classInfo.class_teacher_name || '-'}</TableCell>
                  <TableCell>{classInfo.student_count || 0}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(classInfo)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {classes.length === 0 && (
            <p className="text-gray-500 text-center py-8">No classes found</p>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingClass(null); }}
        title={editingClass ? 'Edit Class' : 'Add New Class'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              >
                <option value="">Select Class</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={`Class ${i + 1}`}>Class {i + 1}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                required
              >
                <option value="">Select Section</option>
                {['A', 'B', 'C', 'D'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <Input
            label="Academic Year"
            value={formData.academic_year}
            onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
            required
            placeholder="e.g., 2024-25"
          />
          <Input
            label="Room Number"
            value={formData.room_number}
            onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
            placeholder="e.g., Room 101"
          />
          <Input
            label="Class Teacher ID (optional)"
            type="number"
            value={formData.class_teacher_id}
            onChange={(e) => setFormData({ ...formData, class_teacher_id: e.target.value })}
            placeholder="Teacher ID"
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); setEditingClass(null); }}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              {editingClass ? 'Update' : 'Create'} Class
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
