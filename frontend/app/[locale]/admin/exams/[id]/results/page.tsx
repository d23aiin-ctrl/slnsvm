'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { adminApi } from '@/lib/api';
import { ClipboardList, ArrowLeft, Save, Users } from 'lucide-react';
import Link from 'next/link';

interface Exam {
  id: number;
  name: string;
  academic_year: string;
}

interface Student {
  id: number;
  name: string;
  roll_no?: number;
  admission_no: string;
}

interface ClassInfo {
  id: number;
  name: string;
  section?: string;
}

interface Subject {
  id: number;
  name: string;
  code: string;
}

interface ExamResult {
  id: number;
  student_id: number;
  subject_id: number;
  marks_obtained: number;
  grade?: string;
  remarks?: string;
  student_name?: string;
  subject_name?: string;
  max_marks?: number;
}

interface StudentMarks {
  student_id: number;
  student_name: string;
  roll_no?: number;
  marks_obtained: string;
  grade: string;
  remarks: string;
}

export default function ExamResultsPage() {
  const params = useParams();
  const examId = Number(params.id);

  const [exam, setExam] = useState<Exam | null>(null);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [existingResults, setExistingResults] = useState<ExamResult[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [studentMarks, setStudentMarks] = useState<StudentMarks[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [maxMarks, setMaxMarks] = useState<number>(100);

  const fetchInitialData = useCallback(async () => {
    try {
      const [examData, classesData, subjectsData] = await Promise.all([
        adminApi.getExam(examId),
        adminApi.getClasses(),
        adminApi.getSubjects()
      ]);
      setExam(examData);
      setClasses(classesData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [examId]);

  const fetchStudents = useCallback(async () => {
    if (!selectedClass) return;
    try {
      const data = await adminApi.getStudents({ class_id: selectedClass });
      setStudents(data);
      // Initialize student marks
      setStudentMarks(data.map((s: Student) => ({
        student_id: s.id,
        student_name: s.name,
        roll_no: s.roll_no,
        marks_obtained: '',
        grade: '',
        remarks: ''
      })));
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  }, [selectedClass]);

  const fetchResults = useCallback(async () => {
    if (!selectedClass || !selectedSubject) return;
    try {
      const results = await adminApi.getExamResults(examId, {
        class_id: selectedClass,
        subject_id: selectedSubject
      });
      setExistingResults(results);

      // Update student marks with existing results
      setStudentMarks(prev => prev.map(sm => {
        const existing = results.find((r: ExamResult) => r.student_id === sm.student_id);
        if (existing) {
          setMaxMarks(existing.max_marks || 100);
          return {
            ...sm,
            marks_obtained: existing.marks_obtained?.toString() || '',
            grade: existing.grade || '',
            remarks: existing.remarks || ''
          };
        }
        return sm;
      }));
    } catch (error) {
      console.error('Failed to fetch results:', error);
    }
  }, [examId, selectedClass, selectedSubject]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [fetchStudents, selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedSubject) {
      fetchResults();
    }
  }, [fetchResults, selectedClass, selectedSubject]);

  const updateStudentMarks = (studentId: number, field: string, value: string) => {
    setStudentMarks(prev => prev.map(sm =>
      sm.student_id === studentId ? { ...sm, [field]: value } : sm
    ));
  };

  const calculateGrade = (marks: number): string => {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  };

  const handleSave = async () => {
    if (!selectedSubject) return;

    const resultsToSave = studentMarks
      .filter(sm => sm.marks_obtained !== '')
      .map(sm => ({
        student_id: sm.student_id,
        marks_obtained: parseFloat(sm.marks_obtained),
        grade: sm.grade || calculateGrade(parseFloat(sm.marks_obtained)),
        remarks: sm.remarks
      }));

    if (resultsToSave.length === 0) {
      alert('Please enter marks for at least one student');
      return;
    }

    setSaving(true);
    try {
      await adminApi.addBulkResults({
        exam_id: examId,
        subject_id: selectedSubject,
        results: resultsToSave
      });
      alert('Results saved successfully!');
      fetchResults();
    } catch (error) {
      alert('Failed to save results');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Exam not found</p>
        <Link href="/admin/exams">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Exams
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href={`/admin/exams/${examId}`}>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{exam.name} - Results</h1>
            <p className="text-gray-600">Enter and manage exam results</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card variant="elevated">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
              <select
                className="w-48 px-4 py-2 border border-gray-300 rounded-lg"
                value={selectedClass || ''}
                onChange={(e) => {
                  setSelectedClass(Number(e.target.value));
                  setSelectedSubject(null);
                }}
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name} {cls.section || ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Subject</label>
              <select
                className="w-48 px-4 py-2 border border-gray-300 rounded-lg"
                value={selectedSubject || ''}
                onChange={(e) => setSelectedSubject(Number(e.target.value))}
                disabled={!selectedClass}
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks</label>
              <input
                type="number"
                className="w-24 px-4 py-2 border border-gray-300 rounded-lg"
                value={maxMarks}
                onChange={(e) => setMaxMarks(Number(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Entry */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <ClipboardList className="w-5 h-5 mr-2 text-primary-600" />
              Enter Results
            </CardTitle>
            {studentMarks.length > 0 && selectedSubject && (
              <Button onClick={handleSave} isLoading={saving}>
                <Save className="w-4 h-4 mr-2" />
                Save Results
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!selectedClass || !selectedSubject ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Select a class and subject to enter results</p>
            </div>
          ) : studentMarks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Marks (/{maxMarks})</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentMarks.map((sm) => (
                  <TableRow key={sm.student_id}>
                    <TableCell className="font-medium">{sm.roll_no || '-'}</TableCell>
                    <TableCell>{sm.student_name}</TableCell>
                    <TableCell>
                      <input
                        type="number"
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                        min="0"
                        max={maxMarks}
                        value={sm.marks_obtained}
                        onChange={(e) => updateStudentMarks(sm.student_id, 'marks_obtained', e.target.value)}
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell>
                      <select
                        className="w-20 px-2 py-1 border border-gray-300 rounded"
                        value={sm.grade || (sm.marks_obtained ? calculateGrade(parseFloat(sm.marks_obtained)) : '')}
                        onChange={(e) => updateStudentMarks(sm.student_id, 'grade', e.target.value)}
                      >
                        <option value="">Auto</option>
                        <option value="A+">A+</option>
                        <option value="A">A</option>
                        <option value="B+">B+</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="F">F</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      <input
                        type="text"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Optional remarks..."
                        value={sm.remarks}
                        onChange={(e) => updateStudentMarks(sm.student_id, 'remarks', e.target.value)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No students found in this class</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
