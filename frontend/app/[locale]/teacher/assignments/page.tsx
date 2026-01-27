'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { FileText, Plus, Calendar, Users, Eye, Trash2, CheckCircle, XCircle, BookOpen, ArrowLeft, ChevronRight } from 'lucide-react';
import { teacherApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Assignment {
  id: number;
  title: string;
  description: string;
  class_name: string;
  section: string;
  subject_name: string;
  due_date: string;
  created_at: string;
  submission_count: number;
  total_students: number;
  max_marks?: number;
}

interface ClassOption {
  id: number;
  name: string;
  section?: string;
  display_name: string;
}

interface SubjectOption {
  id: number;
  name: string;
  code: string;
  class_id?: number;
}

interface Submission {
  id: number;
  student_id: number;
  student_name: string;
  roll_no?: number;
  submitted_at: string;
  file_url?: string;
  remarks?: string;
  marks_obtained?: number;
  feedback?: string;
  graded_at?: string;
}

interface SubjectGroup {
  name: string;
  assignmentCount: number;
  classes: string[];
}

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    class_id: '',
    subject_id: '',
    due_date: '',
    max_marks: '100',
  });
  const [saving, setSaving] = useState(false);
  const [gradingId, setGradingId] = useState<number | null>(null);
  const [gradeData, setGradeData] = useState({ marks: '', feedback: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignmentsData, classesData, subjectsData] = await Promise.all([
        teacherApi.getAssignments(),
        teacherApi.getMyClasses(),
        teacherApi.getMySubjects()
      ]);
      setAssignments(assignmentsData);
      setClasses(classesData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group assignments by subject
  const subjectNames = subjects.reduce((acc, s) => {
    if (s.name && !acc.includes(s.name)) {
      acc.push(s.name);
    }
    return acc;
  }, [] as string[]);

  const subjectGroups: SubjectGroup[] = subjectNames.map(subjectName => {
    const subjectAssignments = assignments.filter(a => a.subject_name === subjectName);
    const classNames = subjectAssignments.reduce((acc, a) => {
      const name = `${a.class_name} ${a.section}`;
      if (!acc.includes(name)) {
        acc.push(name);
      }
      return acc;
    }, [] as string[]);
    return {
      name: subjectName,
      assignmentCount: subjectAssignments.length,
      classes: classNames
    };
  });

  // Get assignments for selected subject
  const filteredAssignments = selectedSubject
    ? assignments.filter(a => a.subject_name === selectedSubject)
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await teacherApi.createAssignment({
        title: formData.title,
        description: formData.description,
        class_id: parseInt(formData.class_id),
        subject_id: parseInt(formData.subject_id),
        due_date: formData.due_date,
        max_marks: parseInt(formData.max_marks) || 100,
      });
      fetchData();
      setShowAddModal(false);
      setFormData({ title: '', description: '', class_id: '', subject_id: '', due_date: '', max_marks: '100' });
    } catch (error) {
      alert('Failed to create assignment');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await teacherApi.deleteAssignment(id);
      fetchData();
    } catch (error) {
      alert('Failed to delete assignment');
    }
  };

  const viewSubmissions = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    try {
      const data = await teacherApi.getAssignmentSubmissions(assignment.id);
      setSubmissions(data.submissions);
      setShowSubmissionsModal(true);
    } catch (error) {
      alert('Failed to load submissions');
    }
  };

  const handleGrade = async (submissionId: number) => {
    if (!gradeData.marks) return;
    try {
      await teacherApi.gradeSubmission(
        submissionId,
        parseFloat(gradeData.marks),
        gradeData.feedback || undefined
      );
      if (selectedAssignment) {
        const data = await teacherApi.getAssignmentSubmissions(selectedAssignment.id);
        setSubmissions(data.submissions);
      }
      setGradingId(null);
      setGradeData({ marks: '', feedback: '' });
      fetchData();
    } catch (error) {
      alert('Failed to grade submission');
    }
  };

  // Filter subjects based on selected class for the form
  const filteredSubjects = formData.class_id
    ? subjects.filter(s => !s.class_id || s.class_id === parseInt(formData.class_id))
    : subjects;

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
          {selectedSubject ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedSubject(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedSubject} Assignments</h1>
                <p className="text-gray-600">{filteredAssignments.length} assignment(s)</p>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
              <p className="text-gray-600">Select a subject to view assignments</p>
            </>
          )}
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Assignment
        </Button>
      </div>

      {!selectedSubject ? (
        // Subject Cards View
        subjectGroups.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No subjects assigned</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjectGroups.map((subject) => (
              <Card
                key={subject.name}
                variant="elevated"
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedSubject(subject.name)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary-100 rounded-lg">
                        <BookOpen className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
                        <p className="text-sm text-gray-500">
                          {subject.assignmentCount} assignment{subject.assignmentCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                  {subject.classes.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-gray-500 mb-2">Classes</p>
                      <div className="flex flex-wrap gap-1">
                        {subject.classes.map((cls, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {cls}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        // Assignments List for Selected Subject
        filteredAssignments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No assignments for {selectedSubject}</p>
              <Button className="mt-4" onClick={() => setShowAddModal(true)}>
                Create Assignment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAssignments.map((assignment) => (
              <Card key={assignment.id} variant="elevated">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewSubmissions(assignment)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="View Submissions"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(assignment.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{assignment.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-500">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{assignment.class_name} {assignment.section}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Due: {formatDate(assignment.due_date)}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Submissions</span>
                      <span className="text-sm font-medium">
                        {assignment.submission_count} / {assignment.total_students}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{
                          width: `${assignment.total_students > 0 ? (assignment.submission_count / assignment.total_students) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Add Assignment Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create New Assignment"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="Assignment title"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              placeholder="Assignment description and instructions"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.class_id}
                onChange={(e) => setFormData({ ...formData, class_id: e.target.value, subject_id: '' })}
                required
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.display_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.subject_id}
                onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                required
              >
                <option value="">Select Subject</option>
                {filteredSubjects.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Due Date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              required
            />
            <Input
              label="Max Marks"
              type="number"
              value={formData.max_marks}
              onChange={(e) => setFormData({ ...formData, max_marks: e.target.value })}
              placeholder="100"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              Create Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Submissions Modal */}
      <Modal
        isOpen={showSubmissionsModal}
        onClose={() => {
          setShowSubmissionsModal(false);
          setSelectedAssignment(null);
          setGradingId(null);
        }}
        title={`Submissions - ${selectedAssignment?.title || ''}`}
        size="xl"
      >
        <div className="max-h-[60vh] overflow-y-auto">
          {submissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No submissions yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Roll No</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Student</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Submitted</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Marks</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submissions.map(sub => (
                  <tr key={sub.id}>
                    <td className="px-4 py-3 text-sm">{sub.roll_no || '-'}</td>
                    <td className="px-4 py-3 text-sm font-medium">{sub.student_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {sub.submitted_at ? formatDate(sub.submitted_at) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {gradingId === sub.id ? (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            className="w-16 px-2 py-1 border rounded text-sm"
                            placeholder="Marks"
                            value={gradeData.marks}
                            onChange={(e) => setGradeData({ ...gradeData, marks: e.target.value })}
                          />
                          <span className="text-gray-400 self-center">/ {selectedAssignment?.max_marks || 100}</span>
                        </div>
                      ) : sub.marks_obtained !== null && sub.marks_obtained !== undefined ? (
                        <span className="font-medium text-green-600">
                          {sub.marks_obtained} / {selectedAssignment?.max_marks || 100}
                        </span>
                      ) : (
                        <span className="text-gray-400">Not graded</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {gradingId === sub.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleGrade(sub.id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setGradingId(null);
                              setGradeData({ marks: '', feedback: '' });
                            }}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setGradingId(sub.id);
                            setGradeData({
                              marks: sub.marks_obtained?.toString() || '',
                              feedback: sub.feedback || ''
                            });
                          }}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {sub.marks_obtained !== null ? 'Edit' : 'Grade'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Modal>
    </div>
  );
}
