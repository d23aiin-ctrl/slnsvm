'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { adminApi } from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import { IndianRupee, Plus, Search, Filter, CheckCircle, Clock, XCircle } from 'lucide-react';
import BulkImportExport from '@/components/admin/BulkImportExport';

interface Fee {
  id: number;
  student_id: number;
  student_name?: string;
  student_admission_no?: string;
  fee_type: string;
  amount: number;
  due_date: string;
  paid_date?: string;
  status: 'pending' | 'paid' | 'overdue';
  payment_method?: string;
  transaction_id?: string;
}

export default function AdminFeesPage() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [formData, setFormData] = useState({
    student_admission_no: '',
    fee_type: '',
    amount: '',
    due_date: '',
    description: '',
  });
  const [bulkFormData, setBulkFormData] = useState({
    class_id: '',
    fee_type: '',
    amount: '',
    due_date: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchFees = useCallback(async () => {
    try {
      const status = statusFilter !== 'all' ? statusFilter : undefined;
      const data = await adminApi.getFees(status);
      setFees(data);
    } catch (error) {
      console.error('Failed to fetch fees:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.createFee({
        ...formData,
        amount: parseFloat(formData.amount),
      });
      fetchFees();
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      alert('Failed to create fee');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.createBulkFees({
        ...bulkFormData,
        class_id: parseInt(bulkFormData.class_id),
        amount: parseFloat(bulkFormData.amount),
      });
      fetchFees();
      setShowBulkModal(false);
      resetBulkForm();
    } catch (error) {
      alert('Failed to create bulk fees');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      student_admission_no: '',
      fee_type: '',
      amount: '',
      due_date: '',
      description: '',
    });
  };

  const resetBulkForm = () => {
    setBulkFormData({
      class_id: '',
      fee_type: '',
      amount: '',
      due_date: '',
      description: '',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Overdue
          </span>
        );
      default:
        return status;
    }
  };

  const filteredFees = fees.filter(
    (f) =>
      f.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.student_admission_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.fee_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPending = fees.filter(f => f.status === 'pending').reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
  const totalOverdue = fees.filter(f => f.status === 'overdue').reduce((sum, f) => sum + f.amount, 0);

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
          <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-600">Manage student fee records</p>
        </div>
        <div className="flex gap-3 items-center">
          <BulkImportExport entityType="fees" onImportSuccess={fetchFees} />
          <Button variant="outline" onClick={() => setShowBulkModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Bulk Create
          </Button>
          <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Fee
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Fees</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPending)}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Collected Fees</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue Fees</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalOverdue)}</p>
              </div>
              <XCircle className="w-10 h-10 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center">
              <IndianRupee className="w-5 h-5 mr-2 text-primary-600" />
              Fee Records ({filteredFees.length})
            </CardTitle>
            <div className="flex gap-3">
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search fees..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Fee Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paid Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFees.map((fee) => (
                <TableRow key={fee.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{fee.student_name || '-'}</p>
                      <p className="text-xs text-gray-500">{fee.student_admission_no}</p>
                    </div>
                  </TableCell>
                  <TableCell>{fee.fee_type}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(fee.amount)}</TableCell>
                  <TableCell>{formatDate(fee.due_date)}</TableCell>
                  <TableCell>{getStatusBadge(fee.status)}</TableCell>
                  <TableCell>{fee.paid_date ? formatDate(fee.paid_date) : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredFees.length === 0 && (
            <p className="text-gray-500 text-center py-8">No fee records found</p>
          )}
        </CardContent>
      </Card>

      {/* Add Single Fee Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Fee"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Student Admission No"
            value={formData.student_admission_no}
            onChange={(e) => setFormData({ ...formData, student_admission_no: e.target.value })}
            required
            placeholder="e.g., 2024001"
          />
          <Input
            label="Fee Type"
            value={formData.fee_type}
            onChange={(e) => setFormData({ ...formData, fee_type: e.target.value })}
            required
            placeholder="e.g., Tuition Fee, Exam Fee"
          />
          <Input
            label="Amount (₹)"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
          <Input
            label="Due Date"
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            required
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              Create Fee
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Create Fee Modal */}
      <Modal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title="Bulk Create Fees"
      >
        <form onSubmit={handleBulkSubmit} className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Create fee records for all students in a class at once.
          </p>
          <Input
            label="Class ID"
            type="number"
            value={bulkFormData.class_id}
            onChange={(e) => setBulkFormData({ ...bulkFormData, class_id: e.target.value })}
            required
            placeholder="Enter class ID"
          />
          <Input
            label="Fee Type"
            value={bulkFormData.fee_type}
            onChange={(e) => setBulkFormData({ ...bulkFormData, fee_type: e.target.value })}
            required
            placeholder="e.g., Tuition Fee, Exam Fee"
          />
          <Input
            label="Amount (₹)"
            type="number"
            value={bulkFormData.amount}
            onChange={(e) => setBulkFormData({ ...bulkFormData, amount: e.target.value })}
            required
          />
          <Input
            label="Due Date"
            type="date"
            value={bulkFormData.due_date}
            onChange={(e) => setBulkFormData({ ...bulkFormData, due_date: e.target.value })}
            required
          />
          <Input
            label="Description"
            value={bulkFormData.description}
            onChange={(e) => setBulkFormData({ ...bulkFormData, description: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowBulkModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              Create Bulk Fees
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
