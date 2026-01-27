'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { studentApi } from '@/lib/api';
import { Award, TrendingUp } from 'lucide-react';

interface ExamResult {
  id: number;
  exam_name: string;
  subject_name: string;
  marks_obtained: number;
  grade: string;
  remarks: string;
}

export default function ResultsPage() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await studentApi.getResults();
        setResults(data);
      } catch (error) {
        console.error('Failed to fetch results:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      'A+': 'success', 'A': 'success', 'A-': 'success',
      'B+': 'info', 'B': 'info', 'B-': 'info',
      'C+': 'warning', 'C': 'warning', 'C-': 'warning',
      'D': 'danger', 'F': 'danger',
    };
    return colors[grade] || 'default';
  };

  // Group results by exam
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.exam_name]) {
      acc[result.exam_name] = [];
    }
    acc[result.exam_name].push(result);
    return acc;
  }, {} as Record<string, ExamResult[]>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Exam Results</h1>
        <p className="text-gray-600">View your examination results and grades</p>
      </div>

      {results.length === 0 ? (
        <Card variant="elevated">
          <CardContent className="text-center py-12">
            <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No results available yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedResults).map(([examName, examResults]) => (
            <Card key={examName} variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
                  {examName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Subject</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Marks</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Grade</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {examResults.map((result) => (
                        <tr key={result.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">{result.subject_name}</td>
                          <td className="px-4 py-3 text-center font-medium">{result.marks_obtained}</td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={getGradeColor(result.grade) as any}>
                              {result.grade}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{result.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
