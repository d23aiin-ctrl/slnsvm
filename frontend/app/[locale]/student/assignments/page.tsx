'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { studentApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  FileText, Calendar, User, Download, Upload, CheckCircle,
  Clock, AlertCircle, Paperclip, X, Eye, BookOpen, ChevronLeft
} from 'lucide-react';

interface AssignmentWithSubmission {
  id: number;
  title: string;
  description: string;
  due_date: string;
  attachment_url?: string;
  max_marks?: number;
  class_name?: string;
  subject_name?: string;
  teacher_name?: string;
  created_at?: string;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
  submission?: {
    id: number;
    submitted_at: string;
    file_url?: string;
    content?: string;
    marks_obtained?: number;
    feedback?: string;
  };
}

// Subject colors for visual distinction
const SUBJECT_COLORS: Record<string, string> = {
  'Mathematics': 'bg-blue-100 text-blue-800 border-blue-300',
  'Science': 'bg-green-100 text-green-800 border-green-300',
  'English': 'bg-purple-100 text-purple-800 border-purple-300',
  'Hindi': 'bg-orange-100 text-orange-800 border-orange-300',
  'Social Science': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Computer': 'bg-cyan-100 text-cyan-800 border-cyan-300',
};

const getSubjectColor = (subject: string) => {
  return SUBJECT_COLORS[subject] || 'bg-gray-100 text-gray-800 border-gray-300';
};

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentWithSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentWithSubmission | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get unique subjects from assignments
  const subjects = assignments.reduce((acc, a) => {
    const name = a.subject_name;
    if (name && !acc.includes(name)) {
      acc.push(name);
    }
    return acc;
  }, [] as string[]);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const data = await studentApi.getAssignmentsWithSubmissions();
      setAssignments(data);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAssignment) return;
    if (!submissionContent.trim() && !selectedFile) {
      alert('Please add content or upload a file');
      return;
    }

    setSubmitting(true);
    try {
      // Note: File upload would require a separate file upload API
      // For now, we submit text content only
      await studentApi.submitAssignment(
        selectedAssignment.id,
        submissionContent || undefined,
        undefined // file_url would come from file upload API
      );

      alert('Assignment submitted successfully!');
      setSelectedAssignment(null);
      setSubmissionContent('');
      setSelectedFile(null);
      fetchAssignments();
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to submit assignment. Please try again.';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const isPastDue = (dueDate: string) => new Date(dueDate) < new Date();
  const daysUntilDue = (dueDate: string) => {
    const diff = new Date(dueDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (assignment: AssignmentWithSubmission) => {
    if (assignment.status === 'graded') {
      return <Badge variant="success">Graded</Badge>;
    }
    if (assignment.status === 'submitted') {
      return <Badge variant="info">Submitted</Badge>;
    }
    if (assignment.status === 'overdue') {
      return <Badge variant="danger">Past Due</Badge>;
    }
    if (assignment.due_date) {
      const days = daysUntilDue(assignment.due_date);
      if (days <= 2 && days >= 0) {
        return <Badge variant="warning">Due Soon</Badge>;
      }
    }
    return <Badge variant="default">Pending</Badge>;
  };

  const filteredAssignments = assignments.filter(a => {
    // Subject filter
    if (selectedSubject && a.subject_name !== selectedSubject) return false;

    // Status filter
    if (filter === 'all') return true;
    if (filter === 'pending') return a.status === 'pending' || a.status === 'overdue';
    if (filter === 'submitted') return a.status === 'submitted';
    if (filter === 'graded') return a.status === 'graded';
    return true;
  });

  // Get stats for selected subject
  const getSubjectStats = (subject: string) => {
    const subjectAssignments = assignments.filter(a => a.subject_name === subject);
    return {
      total: subjectAssignments.length,
      pending: subjectAssignments.filter(a => a.status === 'pending' || a.status === 'overdue').length,
      submitted: subjectAssignments.filter(a => a.status === 'submitted').length,
      graded: subjectAssignments.filter(a => a.status === 'graded').length,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If no subject is selected, show subject cards view
  if (!selectedSubject) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600">Select a subject to view assignments</p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card variant="bordered">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{assignments.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </CardContent>
          </Card>
          <Card variant="bordered">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {assignments.filter(a => a.status === 'pending' || a.status === 'overdue').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card variant="bordered">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {assignments.filter(a => a.status === 'submitted').length}
              </div>
              <div className="text-sm text-gray-600">Submitted</div>
            </CardContent>
          </Card>
          <Card variant="bordered">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {assignments.filter(a => a.status === 'graded').length}
              </div>
              <div className="text-sm text-gray-600">Graded</div>
            </CardContent>
          </Card>
        </div>

        {/* Subject Cards */}
        {subjects.length === 0 ? (
          <Card variant="elevated">
            <CardContent className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No assignments available</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => {
              const stats = getSubjectStats(subject);
              return (
                <Card
                  key={subject}
                  variant="elevated"
                  className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
                  onClick={() => setSelectedSubject(subject)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg border ${getSubjectColor(subject)}`}>
                        <BookOpen className="w-6 h-6" />
                      </div>
                      {stats.pending > 0 && (
                        <Badge variant="warning">{stats.pending} pending</Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{subject}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{stats.total} total</span>
                      <span className="text-green-600">{stats.graded} graded</span>
                      <span className="text-blue-600">{stats.submitted} submitted</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Subject selected - show assignments for that subject
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <button
            onClick={() => setSelectedSubject(null)}
            className="flex items-center text-primary-600 hover:text-primary-700 mb-2 text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Subjects
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{selectedSubject}</h1>
          <p className="text-gray-600">View and submit assignments</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(['all', 'pending', 'submitted', 'graded'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Subject Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="bordered">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {assignments.filter(a => a.subject_name === selectedSubject).length}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {assignments.filter(a => a.subject_name === selectedSubject && (a.status === 'pending' || a.status === 'overdue')).length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {assignments.filter(a => a.subject_name === selectedSubject && a.status === 'submitted').length}
            </div>
            <div className="text-sm text-gray-600">Submitted</div>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {assignments.filter(a => a.subject_name === selectedSubject && a.status === 'graded').length}
            </div>
            <div className="text-sm text-gray-600">Graded</div>
          </CardContent>
        </Card>
      </div>

      {filteredAssignments.length === 0 ? (
        <Card variant="elevated">
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No assignments found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment.id} variant="elevated" className="hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                      {getStatusBadge(assignment)}
                    </div>
                    <p className="text-gray-600 mb-4">{assignment.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {assignment.teacher_name}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Due: {formatDate(assignment.due_date)}
                      </span>
                      {assignment.max_marks && (
                        <span className="flex items-center">
                          <FileText className="w-4 h-4 mr-1" />
                          Max Marks: {assignment.max_marks}
                        </span>
                      )}
                    </div>

                    {/* Submission Info */}
                    {assignment.status === 'graded' && assignment.submission && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 text-green-700 font-medium mb-1">
                          <CheckCircle className="w-4 h-4" />
                          Graded: {assignment.submission.marks_obtained}/{assignment.max_marks}
                        </div>
                        {assignment.submission.feedback && (
                          <p className="text-sm text-green-600">{assignment.submission.feedback}</p>
                        )}
                      </div>
                    )}

                    {assignment.status === 'submitted' && assignment.submission && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 text-blue-700">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">Submitted on {formatDate(assignment.submission.submitted_at)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {assignment.attachment_url && (
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}

                    {assignment.status === 'pending' && (
                      <Button size="sm" onClick={() => setSelectedAssignment(assignment)}>
                        <Upload className="w-4 h-4 mr-2" />
                        Submit
                      </Button>
                    )}

                    {(assignment.status === 'submitted' || assignment.status === 'graded') && assignment.submission && (
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Submission
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Submission Modal */}
      <Modal
        isOpen={!!selectedAssignment}
        onClose={() => {
          setSelectedAssignment(null);
          setSubmissionContent('');
          setSelectedFile(null);
        }}
        title="Submit Assignment"
        size="lg"
      >
        {selectedAssignment && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-1">{selectedAssignment.title}</h4>
              <p className="text-sm text-gray-600">{selectedAssignment.subject_name}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>Due: {formatDate(selectedAssignment.due_date)}</span>
                <span>Max Marks: {selectedAssignment.max_marks}</span>
              </div>
            </div>

            {/* Text Submission */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Answer / Notes
              </label>
              <textarea
                value={submissionContent}
                onChange={(e) => setSubmissionContent(e.target.value)}
                rows={6}
                placeholder="Type your answer here..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attach File (Optional)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.jpg,.png"
              />

              {selectedFile ? (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{selectedFile.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors"
                >
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload file</p>
                  <p className="text-xs text-gray-400">PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB)</p>
                </button>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setSelectedAssignment(null);
                  setSubmissionContent('');
                  setSelectedFile(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                isLoading={submitting}
                disabled={!submissionContent.trim() && !selectedFile}
              >
                <Upload className="w-4 h-4 mr-2" />
                Submit Assignment
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
