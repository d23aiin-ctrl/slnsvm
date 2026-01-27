'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CreditCard, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { studentApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Fee {
  id: number;
  fee_type: string;
  amount: number;
  paid_amount: number;
  due_date: string | null;
  status: string;
  description: string | null;
  academic_year: string;
}

interface FeeSummary {
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
}

interface FeesData {
  summary: FeeSummary;
  fees: Fee[];
}

export default function StudentFeesPage() {
  const [data, setData] = useState<FeesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      const result = await studentApi.getFees();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Paid</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'overdue':
        return <Badge variant="danger">Overdue</Badge>;
      case 'partial':
        return <Badge variant="info">Partial</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFeeType = (type: string) => {
    return type.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No fee data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fee Details</h1>
        <p className="text-gray-600">View your fee payments and pending dues</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="bordered">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Fees</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{data.summary.total_amount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Paid Amount</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{data.summary.paid_amount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Amount</p>
                <p className="text-2xl font-bold text-red-600">
                  ₹{data.summary.pending_amount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee List */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-primary-600" />
            Fee Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.fees.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No fee records found</p>
          ) : (
            <div className="space-y-4">
              {data.fees.map((fee) => (
                <div
                  key={fee.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(fee.status)}
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {formatFeeType(fee.fee_type)}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        {fee.description && (
                          <span>{fee.description}</span>
                        )}
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Due: {fee.due_date ? formatDate(fee.due_date) : 'N/A'}
                        </span>
                        <span>{fee.academic_year}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-lg font-bold text-gray-900">
                          ₹{fee.amount.toLocaleString()}
                        </p>
                        {fee.paid_amount > 0 && fee.paid_amount < fee.amount && (
                          <p className="text-sm text-green-600">
                            Paid: ₹{fee.paid_amount.toLocaleString()}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(fee.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Note */}
      {data.summary.pending_amount > 0 && (
        <Card variant="bordered" className="border-yellow-200 bg-yellow-50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Payment Reminder</p>
                <p className="text-sm text-yellow-700">
                  You have pending fees of ₹{data.summary.pending_amount.toLocaleString()}.
                  Please contact your parent/guardian to complete the payment through the parent portal.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
