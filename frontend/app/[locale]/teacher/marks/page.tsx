'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { BarChart3, Save, Users } from 'lucide-react';
import { api } from '@/lib/api';

interface Student {
  id: number;
  name: string;
  roll_no: number;
  admission_no: string;
}

interface ExamInfo {
  id: number;
  name: string;
  class_id: number;
  class_name: string;
  subject_id: number;
  subject_name: string;
  max_marks: number;
  date: string;
}

// Create a unique key for each exam entry
const getExamKey = (exam: ExamInfo) => `${exam.id}-${exam.class_id}-${exam.subject_id}`;

export default function TeacherMarksPage() {
  const [exams, setExams] = useState<ExamInfo[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Record<number, number>>({});
  const [selectedExam, setSelectedExam] = useState<ExamInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await api.get('/teachers/exams');
      setExams(response.data);
    } catch (error) {
      console.error('Failed to fetch exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsForExam = async (exam: ExamInfo) => {
    setSelectedExam(exam);
    try {
      const response = await api.get(`/teachers/exam/${exam.id}/students?class_id=${exam.class_id}`);
      setStudents(response.data.students || []);
      // Initialize marks from existing data - filter by subject_id
      const existingMarks: Record<number, number> = {};
      (response.data.marks || []).forEach((m: any) => {
        if (m.subject_id === exam.subject_id) {
          existingMarks[m.student_id] = m.marks_obtained;
        }
      });
      setMarks(existingMarks);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setStudents([]);
    }
  };

  const handleMarksChange = (studentId: number, value: string) => {
    const numValue = parseInt(value) || 0;
    if (selectedExam && numValue <= selectedExam.max_marks) {
      setMarks({ ...marks, [studentId]: numValue });
    }
  };

  const handleSaveMarks = async () => {
    if (!selectedExam) return;
    setSaving(true);
    try {
      const results = Object.entries(marks).map(([studentId, marksObtained]) => ({
        student_id: parseInt(studentId),
        marks_obtained: marksObtained,
      }));
      await api.post('/teachers/marks', {
        exam_id: selectedExam.id,
        subject_id: selectedExam.subject_id,
        results: results
      });
      alert('Marks saved successfully!');
    } catch (error) {
      alert('Failed to save marks');
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marks Entry</h1>
        <p className="text-gray-600">Enter and manage student marks</p>
      </div>

      {/* Exam Selection */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-primary-600" />
            Select Exam
          </CardTitle>
        </CardHeader>
        <CardContent>
          {exams.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No exams available for marks entry</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exams.map((exam) => {
                const examKey = getExamKey(exam);
                const isSelected = selectedExam && getExamKey(selectedExam) === examKey;
                return (
                  <button
                    key={examKey}
                    onClick={() => fetchStudentsForExam(exam)}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <h4 className="font-medium text-gray-900">{exam.name}</h4>
                    <p className="text-sm text-gray-500">
                      {exam.class_name} - {exam.subject_name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Max Marks: {exam.max_marks}</p>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Marks Entry Table */}
      {selectedExam && (
        <Card variant="elevated">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary-600" />
                {selectedExam.name} - {selectedExam.class_name} ({selectedExam.subject_name})
              </CardTitle>
              <Button onClick={handleSaveMarks} isLoading={saving}>
                <Save className="w-4 h-4 mr-2" />
                Save Marks
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No students found for this class</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Admission No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Marks (Max: {selectedExam.max_marks})</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.roll_no}</TableCell>
                      <TableCell>{student.admission_no}</TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max={selectedExam.max_marks}
                          value={marks[student.id] || ''}
                          onChange={(e) => handleMarksChange(student.id, e.target.value)}
                          className="w-24"
                          placeholder="0"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
