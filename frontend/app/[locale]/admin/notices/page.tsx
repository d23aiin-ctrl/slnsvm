'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { adminApi } from '@/lib/api';
import { Notice } from '@/types';
import { formatDate } from '@/lib/utils';
import { Bell, Plus, Pencil, Trash2 } from 'lucide-react';

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_role: '',
    priority: 'normal',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const data = await adminApi.getNotices();
      setNotices(data);
    } catch (error) {
      console.error('Failed to fetch notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...formData,
        target_role: formData.target_role || null,
      };
      if (editingNotice) {
        await adminApi.updateNotice(editingNotice.id, data);
      } else {
        await adminApi.createNotice(data);
      }
      fetchNotices();
      setShowModal(false);
      setEditingNotice(null);
      resetForm();
    } catch (error) {
      alert('Failed to save notice');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    try {
      await adminApi.deleteNotice(id);
      fetchNotices();
    } catch (error) {
      alert('Failed to delete notice');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      target_role: '',
      priority: 'normal',
    });
  };

  const openEditModal = (notice: Notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      target_role: notice.target_role || '',
      priority: notice.priority,
    });
    setShowModal(true);
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      default: return 'default';
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
          <h1 className="text-2xl font-bold text-gray-900">Notice Management</h1>
          <p className="text-gray-600">Create and manage school notices</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Notice
        </Button>
      </div>

      <div className="space-y-4">
        {notices.length === 0 ? (
          <Card variant="elevated">
            <CardContent className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No notices found</p>
            </CardContent>
          </Card>
        ) : (
          notices.map((notice) => (
            <Card key={notice.id} variant="elevated">
              <CardContent>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{notice.title}</h3>
                      <Badge variant={getPriorityVariant(notice.priority) as any}>
                        {notice.priority}
                      </Badge>
                      {notice.target_role && (
                        <Badge variant="info">{notice.target_role}</Badge>
                      )}
                      {!notice.is_active && (
                        <Badge variant="default">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{notice.content}</p>
                    <p className="text-sm text-gray-500">
                      Posted on {formatDate(notice.created_at)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(notice)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(notice.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingNotice(null); }}
        title={editingNotice ? 'Edit Notice' : 'Create New Notice'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={5}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
            ></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.target_role}
                onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
              >
                <option value="">All Users</option>
                <option value="student">Students Only</option>
                <option value="parent">Parents Only</option>
                <option value="teacher">Teachers Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowModal(false); setEditingNotice(null); }}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              {editingNotice ? 'Update' : 'Create'} Notice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
