'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { adminApi } from '@/lib/api';
import { Student } from '@/types';
import { formatDate } from '@/lib/utils';
import { Users, Plus, Pencil, Trash2, Search } from 'lucide-react';
import BulkImportExport from '@/components/admin/BulkImportExport';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    admission_no: '',
    name: '',
    section: '',
    roll_no: '',
    dob: '',
    gender: '',
    phone: '',
    address: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await adminApi.getStudents();
      setStudents(data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingStudent) {
        await adminApi.updateStudent(editingStudent.id, formData);
      } else {
        await adminApi.createStudent(formData);
      }
      fetchStudents();
      setShowAddModal(false);
      setEditingStudent(null);
      resetForm();
    } catch (error) {
      alert('Failed to save student');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      await adminApi.deleteStudent(id);
      fetchStudents();
    } catch (error) {
      alert('Failed to delete student');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      admission_no: '',
      name: '',
      section: '',
      roll_no: '',
      dob: '',
      gender: '',
      phone: '',
      address: '',
    });
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      email: '',
      password: '',
      admission_no: student.admission_no,
      name: student.name,
      section: student.section || '',
      roll_no: student.roll_no?.toString() || '',
      dob: student.dob || '',
      gender: student.gender || '',
      phone: student.phone || '',
      address: student.address || '',
    });
    setShowAddModal(true);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admission_no.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-600">Manage student records</p>
        </div>
        <div className="flex gap-3 items-center">
          <BulkImportExport entityType="students" onImportSuccess={fetchStudents} />
          <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-primary-600" />
              Students ({filteredStudents.length})
            </CardTitle>
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
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
                <TableHead>Admission No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Roll No</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.admission_no}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.section || '-'}</TableCell>
                  <TableCell>{student.roll_no || '-'}</TableCell>
                  <TableCell>{student.phone || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(student)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
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
          {filteredStudents.length === 0 && (
            <p className="text-gray-500 text-center py-8">No students found</p>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingStudent(null); }}
        title={editingStudent ? 'Edit Student' : 'Add New Student'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {!editingStudent && (
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
              label="Admission No"
              value={formData.admission_no}
              onChange={(e) => setFormData({ ...formData, admission_no: e.target.value })}
              required
            />
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Section"
              value={formData.section}
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
            />
            <Input
              label="Roll No"
              type="number"
              value={formData.roll_no}
              onChange={(e) => setFormData({ ...formData, roll_no: e.target.value })}
            />
            <Input
              label="Date of Birth"
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); setEditingStudent(null); }}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              {editingStudent ? 'Update' : 'Create'} Student
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
