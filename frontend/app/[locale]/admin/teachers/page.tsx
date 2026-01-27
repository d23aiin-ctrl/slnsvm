'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { GraduationCap, Plus, Pencil, Trash2, Search } from 'lucide-react';
import BulkImportExport from '@/components/admin/BulkImportExport';

interface Teacher {
  id: number;
  employee_id: string;
  name: string;
  phone?: string;
  qualification?: string;
  experience_years?: number;
  join_date?: string;
  address?: string;
}

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    employee_id: '',
    name: '',
    phone: '',
    qualification: '',
    experience_years: '',
    join_date: '',
    address: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const data = await adminApi.getTeachers();
      setTeachers(data);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
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
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
      };
      if (editingTeacher) {
        await adminApi.updateTeacher(editingTeacher.id, payload);
      } else {
        await adminApi.createTeacher(payload);
      }
      fetchTeachers();
      setShowAddModal(false);
      setEditingTeacher(null);
      resetForm();
    } catch (error) {
      alert('Failed to save teacher');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    try {
      await adminApi.deleteTeacher(id);
      fetchTeachers();
    } catch (error) {
      alert('Failed to delete teacher');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      employee_id: '',
      name: '',
      phone: '',
      qualification: '',
      experience_years: '',
      join_date: '',
      address: '',
    });
  };

  const openEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      email: '',
      password: '',
      employee_id: teacher.employee_id,
      name: teacher.name,
      phone: teacher.phone || '',
      qualification: teacher.qualification || '',
      experience_years: teacher.experience_years?.toString() || '',
      join_date: teacher.join_date || '',
      address: teacher.address || '',
    });
    setShowAddModal(true);
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Teacher Management</h1>
          <p className="text-gray-600">Manage teacher records</p>
        </div>
        <div className="flex gap-3 items-center">
          <BulkImportExport entityType="teachers" onImportSuccess={fetchTeachers} />
          <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Teacher
          </Button>
        </div>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <GraduationCap className="w-5 h-5 mr-2 text-primary-600" />
              Teachers ({filteredTeachers.length})
            </CardTitle>
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search teachers..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Qualification</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">{teacher.employee_id}</TableCell>
                  <TableCell>{teacher.name}</TableCell>
                  <TableCell>{teacher.phone || '-'}</TableCell>
                  <TableCell>{teacher.qualification || '-'}</TableCell>
                  <TableCell>{teacher.experience_years ? `${teacher.experience_years} years` : '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(teacher)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(teacher.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredTeachers.length === 0 && (
            <p className="text-gray-500 text-center py-8">No teachers found</p>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingTeacher(null); }}
        title={editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {!editingTeacher && (
              <>
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </>
            )}
            <Input
              label="Employee ID"
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              required
            />
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Qualification"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
            />
            <Input
              label="Experience (Years)"
              type="number"
              value={formData.experience_years}
              onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
            />
            <Input
              label="Join Date"
              type="date"
              value={formData.join_date}
              onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
            />
          </div>
          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); setEditingTeacher(null); }}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              {editingTeacher ? 'Update' : 'Create'} Teacher
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
