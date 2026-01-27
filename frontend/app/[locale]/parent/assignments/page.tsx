'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FileText, CheckCircle, Clock, AlertTriangle, Users, Calendar, Award } from 'lucide-react';
import { parentApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Submission {
  submitted_at: string | null;
  marks_obtained: number | null;
  feedback: string | null;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  subject_name: string;
  teacher_name: string;
  due_date: string | null;
  max_marks: number;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
  submission: Submission | null;
}

interface ChildAssignments {
  student_id: number;
  student_name: string;
  class_name: string;
  section: string;
  assignments: Assignment[];
}

export default function ParentAssignmentsPage() {
  const [childrenAssignments, setChildrenAssignments] = useState<ChildAssignments[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const data = await parentApi.getAssignments();
      setChildrenAssignments(data);
      if (data.length > 0) {
        setSelectedChild(data[0].student_id);
      }
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'graded':
        return <Award className="w-5 h-5 text-green-500" />;
      case 'submitted':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'overdue':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      graded: 'bg-green-100 text-green-800',
      submitted: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
    };
    const labels = {
      graded: 'Graded',
      submitted: 'Submitted',
      pending: 'Pending',
      overdue: 'Overdue',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const currentChildData = childrenAssignments.find(c => c.student_id === selectedChild);
  const filteredAssignments = currentChildData?.assignments.filter(a =>
    statusFilter === 'all' || a.status === statusFilter
  ) || [];

  // Count assignments by status
  const statusCounts = currentChildData?.assignments.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
        <p className="text-gray-600">Track your children&apos;s homework and assignments</p>
      </div>

      {childrenAssignments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No assignments available</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Child Selector */}
          {childrenAssignments.length > 1 && (
            <div className="flex gap-2">
              {childrenAssignments.map(child => (
                <button
                  key={child.student_id}
                  onClick={() => setSelectedChild(child.student_id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedChild === child.student_id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {child.student_name}
                </button>
              ))}
            </div>
          )}

          {currentChildData && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="cursor-pointer" onClick={() => setStatusFilter('all')}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary-600">
                        {currentChildData.assignments.length}
                      </p>
                      <p className="text-sm text-gray-500">Total</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer" onClick={() => setStatusFilter('pending')}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-yellow-600">{statusCounts.pending || 0}</p>
                      <p className="text-sm text-gray-500">Pending</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer" onClick={() => setStatusFilter('submitted')}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">{statusCounts.submitted || 0}</p>
                      <p className="text-sm text-gray-500">Submitted</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer" onClick={() => setStatusFilter('graded')}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">{statusCounts.graded || 0}</p>
                      <p className="text-sm text-gray-500">Graded</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 flex-wrap">
                {['all', 'pending', 'submitted', 'graded', 'overdue'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                      statusFilter === filter
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>

              {/* Assignments List */}
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-primary-600" />
                    Assignments - {currentChildData.student_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredAssignments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No assignments found</p>
                  ) : (
                    <div className="space-y-4">
                      {filteredAssignments.map(assignment => (
                        <div
                          key={assignment.id}
                          className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              {getStatusIcon(assignment.status)}
                              <div>
                                <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                                <p className="text-sm text-primary-600">{assignment.subject_name}</p>
                                {assignment.description && (
                                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                    {assignment.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {assignment.teacher_name}
                                  </span>
                                  {assignment.due_date && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      Due: {formatDate(assignment.due_date)}
                                    </span>
                                  )}
                                  <span>Max Marks: {assignment.max_marks}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              {getStatusBadge(assignment.status)}
                              {assignment.submission && assignment.submission.marks_obtained !== null && (
                                <p className="mt-2 text-lg font-bold text-green-600">
                                  {assignment.submission.marks_obtained}/{assignment.max_marks}
                                </p>
                              )}
                            </div>
                          </div>
                          {assignment.submission && (
                            <div className="mt-3 pt-3 border-t bg-gray-50 -mx-4 -mb-4 px-4 pb-4 rounded-b-lg">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">
                                  Submitted: {assignment.submission.submitted_at
                                    ? formatDate(assignment.submission.submitted_at)
                                    : '-'}
                                </span>
                                {assignment.submission.feedback && (
                                  <div className="text-gray-600">
                                    <span className="font-medium">Feedback:</span> {assignment.submission.feedback}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
