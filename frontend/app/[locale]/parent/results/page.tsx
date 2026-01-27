'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BarChart3, Award, TrendingUp, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { parentApi } from '@/lib/api';

interface SubjectResult {
  subject_name: string;
  marks_obtained: number;
  max_marks: number;
  grade: string | null;
  remarks: string | null;
}

interface ExamResult {
  exam_id: number;
  exam_name: string;
  academic_year: string;
  subjects: SubjectResult[];
  total_marks: number;
  obtained_marks: number;
  percentage: number;
}

interface ChildResults {
  student_id: number;
  student_name: string;
  class_name: string;
  section: string;
  roll_no: number;
  exams: ExamResult[];
}

export default function ParentResultsPage() {
  const [childrenResults, setChildrenResults] = useState<ChildResults[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<number | null>(null);
  const [expandedExams, setExpandedExams] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const data = await parentApi.getResults();
      setChildrenResults(data);
      if (data.length > 0) {
        setSelectedChild(data[0].student_id);
        // Expand first exam by default
        if (data[0].exams.length > 0) {
          setExpandedExams(new Set([data[0].exams[0].exam_id]));
        }
      }
    } catch (error) {
      console.error('Failed to fetch results:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExam = (examId: number) => {
    setExpandedExams(prev => {
      const newSet = new Set(prev);
      if (newSet.has(examId)) {
        newSet.delete(examId);
      } else {
        newSet.add(examId);
      }
      return newSet;
    });
  };

  const getGradeColor = (grade: string | null) => {
    if (!grade) return 'text-gray-500';
    switch (grade.toUpperCase()) {
      case 'A': case 'A+': return 'text-green-600';
      case 'B': case 'B+': return 'text-blue-600';
      case 'C': case 'C+': return 'text-yellow-600';
      case 'D': return 'text-orange-600';
      default: return 'text-red-600';
    }
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const currentChildData = childrenResults.find(c => c.student_id === selectedChild);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Exam Results</h1>
        <p className="text-gray-600">View your children&apos;s exam performance</p>
      </div>

      {childrenResults.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No exam results available</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Child Selector */}
          {childrenResults.length > 1 && (
            <div className="flex gap-2">
              {childrenResults.map(child => (
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
              {/* Student Info */}
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{currentChildData.student_name}</h3>
                      <p className="text-sm text-gray-500">
                        {currentChildData.class_name} - {currentChildData.section} | Roll No: {currentChildData.roll_no}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Exam Results */}
              {currentChildData.exams.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No exam results available for this student</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {currentChildData.exams.map(exam => (
                    <Card key={exam.exam_id} variant="elevated">
                      <CardHeader
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleExam(exam.exam_id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Award className="w-5 h-5 text-primary-600" />
                            <div>
                              <CardTitle className="text-lg">{exam.exam_name}</CardTitle>
                              <p className="text-sm text-gray-500">{exam.academic_year}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className={`text-2xl font-bold ${getPercentageColor(exam.percentage)}`}>
                                {exam.percentage}%
                              </p>
                              <p className="text-xs text-gray-500">
                                {exam.obtained_marks}/{exam.total_marks} marks
                              </p>
                            </div>
                            {expandedExams.has(exam.exam_id) ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      {expandedExams.has(exam.exam_id) && (
                        <CardContent className="border-t">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left py-3 px-4 font-medium text-gray-600">Subject</th>
                                  <th className="text-center py-3 px-4 font-medium text-gray-600">Marks</th>
                                  <th className="text-center py-3 px-4 font-medium text-gray-600">Grade</th>
                                  <th className="text-left py-3 px-4 font-medium text-gray-600">Remarks</th>
                                </tr>
                              </thead>
                              <tbody>
                                {exam.subjects.map((subject, idx) => (
                                  <tr key={idx} className="border-b last:border-0">
                                    <td className="py-3 px-4 font-medium">{subject.subject_name}</td>
                                    <td className="py-3 px-4 text-center">
                                      <span className={`font-semibold ${
                                        (subject.marks_obtained / subject.max_marks * 100) >= 60
                                          ? 'text-green-600'
                                          : (subject.marks_obtained / subject.max_marks * 100) >= 33
                                            ? 'text-yellow-600'
                                            : 'text-red-600'
                                      }`}>
                                        {subject.marks_obtained}
                                      </span>
                                      <span className="text-gray-400">/{subject.max_marks}</span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                      <span className={`font-bold ${getGradeColor(subject.grade)}`}>
                                        {subject.grade || '-'}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-500">
                                      {subject.remarks || '-'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Performance Summary */}
                          <div className="mt-4 pt-4 border-t flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <TrendingUp className="w-4 h-4" />
                              <span>Overall Performance</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <p className="text-sm text-gray-500">Total</p>
                                <p className="font-semibold">{exam.obtained_marks}/{exam.total_marks}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-gray-500">Percentage</p>
                                <p className={`font-bold ${getPercentageColor(exam.percentage)}`}>
                                  {exam.percentage}%
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
