'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { teacherApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Bell, AlertCircle, Info, AlertTriangle, ExternalLink } from 'lucide-react';

interface Notice {
  id: number;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attachment_url?: string;
  created_at: string;
  expires_at?: string;
}

const priorityConfig = {
  low: { color: 'bg-gray-100 text-gray-800', icon: Info, label: 'Low' },
  medium: { color: 'bg-blue-100 text-blue-800', icon: Info, label: 'Medium' },
  high: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle, label: 'High' },
  urgent: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Urgent' }
};

export default function TeacherNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const data = await teacherApi.getNotices();
      setNotices(data);
    } catch (error) {
      console.error('Failed to fetch notices:', error);
    } finally {
      setLoading(false);
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
        <h1 className="text-2xl font-bold text-gray-900">Notices</h1>
        <p className="text-gray-600">Important announcements and updates</p>
      </div>

      {notices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No notices at the moment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notice List */}
          <div className="lg:col-span-1 space-y-3">
            {notices.map(notice => {
              const priority = priorityConfig[notice.priority] || priorityConfig.low;
              const PriorityIcon = priority.icon;
              const isSelected = selectedNotice?.id === notice.id;

              return (
                <Card
                  key={notice.id}
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-primary-500' : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedNotice(notice)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${priority.color}`}>
                        <PriorityIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{notice.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(notice.created_at)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Notice Detail */}
          <div className="lg:col-span-2">
            {selectedNotice ? (
              <Card variant="elevated">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{selectedNotice.title}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        Posted on {formatDate(selectedNotice.created_at)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      priorityConfig[selectedNotice.priority]?.color || 'bg-gray-100'
                    }`}>
                      {priorityConfig[selectedNotice.priority]?.label || 'Normal'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedNotice.content}</p>
                  </div>

                  {selectedNotice.expires_at && (
                    <p className="text-sm text-orange-600 mt-4">
                      Expires on: {formatDate(selectedNotice.expires_at)}
                    </p>
                  )}

                  {selectedNotice.attachment_url && (
                    <a
                      href={selectedNotice.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center mt-4 text-primary-600 hover:underline"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View Attachment
                    </a>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card variant="elevated">
                <CardContent className="py-12 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select a notice to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
