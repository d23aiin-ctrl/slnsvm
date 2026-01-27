'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { FileSpreadsheet, Plus, Pencil, Trash2, Calendar, Eye, ClipboardList } from 'lucide-react';
import Link from 'next/link';

interface Exam {
  id: number;
  name: string;
  academic_year: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  created_at: string;
}

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    academic_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1).toString().slice(-2),
    start_date: '',
    end_date: '',
    description: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const data = await adminApi.getExams();
      setExams(data);
    } catch (error) {
      console.error('Failed to fetch exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      academic_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1).toString().slice(-2),
      start_date: '',
      end_date: '',
      description: ''
    });
  };

  const openAddModal = () => {
    setEditingExam(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (exam: Exam) => {
    setEditingExam(exam);
    setFormData({
      name: exam.name,
      academic_year: exam.academic_year,
      start_date: exam.start_date || '',
      end_date: exam.end_date || '',
      description: exam.description || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        name: formData.name,
        academic_year: formData.academic_year,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        description: formData.description || null
      };

      if (editingExam) {
        await adminApi.updateExam(editingExam.id, data);
      } else {
        await adminApi.createExam(data);
      }

      setShowModal(false);
      fetchExams();
    } catch (error) {
      alert('Failed to save exam');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this exam? This will also delete all related schedules and results.')) return;
    try {
      await adminApi.deleteExam(id);
      fetchExams();
    } catch (error) {
      alert('Failed to delete exam');
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exam Management</h1>
          <p className="text-gray-600">Create and manage exams, schedules, and results</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Create Exam
        </Button>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileSpreadsheet className="w-5 h-5 mr-2 text-primary-600" />
            Exams ({exams.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {exams.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Name</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.name}</TableCell>
                    <TableCell>{exam.academic_year}</TableCell>
                    <TableCell>{exam.start_date ? formatDate(exam.start_date) : '-'}</TableCell>
                    <TableCell>{exam.end_date ? formatDate(exam.end_date) : '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/admin/exams/${exam.id}`}>
                          <button className="p-1 text-green-600 hover:bg-green-50 rounded" title="View Details">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <Link href={`/admin/exams/${exam.id}/results`}>
                          <button className="p-1 text-purple-600 hover:bg-purple-50 rounded" title="Manage Results">
                            <ClipboardList className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => openEditModal(exam)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(exam.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileSpreadsheet className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No exams created yet</p>
              <Button variant="outline" className="mt-4" onClick={openAddModal}>
                <Plus className="w-4 h-4 mr-2" />
                Create your first exam
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingExam ? 'Edit Exam' : 'Create New Exam'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Exam Name"
            placeholder="e.g., Mid-Term Examination"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Academic Year"
            placeholder="e.g., 2024-25"
            value={formData.academic_year}
            onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="Optional description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              {editingExam ? 'Update' : 'Create'} Exam
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
