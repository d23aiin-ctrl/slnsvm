'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { adminApi } from '@/lib/api';
import { Admission } from '@/types';
import { formatDate, getStatusColor } from '@/lib/utils';
import { ClipboardList, Eye, Check, X } from 'lucide-react';

export default function AdminAdmissionsPage() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchAdmissions = useCallback(async () => {
    try {
      const data = await adminApi.getAdmissions(statusFilter || undefined);
      setAdmissions(data);
    } catch (error) {
      console.error('Failed to fetch admissions:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchAdmissions();
  }, [fetchAdmissions]);

  const handleStatusUpdate = async (id: number, status: string) => {
    setUpdating(true);
    try {
      await adminApi.updateAdmission(id, { status });
      fetchAdmissions();
      setSelectedAdmission(null);
    } catch (error) {
      alert('Failed to update status');
    } finally {
      setUpdating(false);
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
        <h1 className="text-2xl font-bold text-gray-900">Admission Management</h1>
        <p className="text-gray-600">Review and process admission applications</p>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <ClipboardList className="w-5 h-5 mr-2 text-primary-600" />
              Applications ({admissions.length})
            </CardTitle>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="waitlisted">Waitlisted</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Application ID</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Class Applied</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Applied On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admissions.map((admission) => (
                <TableRow key={admission.id}>
                  <TableCell className="font-medium">ADM-{admission.id}</TableCell>
                  <TableCell>{admission.student_name}</TableCell>
                  <TableCell>{admission.class_applied}</TableCell>
                  <TableCell>
                    <div>
                      <p>{admission.parent_name}</p>
                      <p className="text-xs text-gray-500">{admission.parent_phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(admission.created_at)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(admission.status)}`}>
                      {admission.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => setSelectedAdmission(admission)}
                      className="p-1 text-primary-600 hover:bg-primary-50 rounded"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {admissions.length === 0 && (
            <p className="text-gray-500 text-center py-8">No applications found</p>
          )}
        </CardContent>
      </Card>

      {/* View Modal */}
      <Modal
        isOpen={!!selectedAdmission}
        onClose={() => setSelectedAdmission(null)}
        title="Application Details"
        size="lg"
      >
        {selectedAdmission && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Student Name</label>
                <p className="font-medium">{selectedAdmission.student_name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Date of Birth</label>
                <p className="font-medium">{formatDate(selectedAdmission.dob)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Gender</label>
                <p className="font-medium capitalize">{selectedAdmission.gender || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Class Applied</label>
                <p className="font-medium">{selectedAdmission.class_applied}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Parent Name</label>
                <p className="font-medium">{selectedAdmission.parent_name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Parent Phone</label>
                <p className="font-medium">{selectedAdmission.parent_phone}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Parent Email</label>
                <p className="font-medium">{selectedAdmission.parent_email || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Previous School</label>
                <p className="font-medium">{selectedAdmission.previous_school || '-'}</p>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-500">Address</label>
              <p className="font-medium">{selectedAdmission.address || '-'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Current Status</label>
              <p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAdmission.status)}`}>
                  {selectedAdmission.status}
                </span>
              </p>
            </div>

            {selectedAdmission.status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleStatusUpdate(selectedAdmission.id, 'under_review')}
                  isLoading={updating}
                >
                  Mark Under Review
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleStatusUpdate(selectedAdmission.id, 'approved')}
                  isLoading={updating}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleStatusUpdate(selectedAdmission.id, 'rejected')}
                  isLoading={updating}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
