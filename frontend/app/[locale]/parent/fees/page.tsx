'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { parentApi, paymentApi } from '@/lib/api';
import { Fee } from '@/types';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { CreditCard, Calendar, CheckCircle, Shield, Smartphone, Building2 } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface FeeSummary {
  total_fees: number;
  total_paid: number;
  total_pending: number;
  overdue_amount: number;
  fees: Fee[];
}

export default function ParentFeesPage() {
  const [feeSummary, setFeeSummary] = useState<FeeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      const data = await parentApi.getFees();
      setFeeSummary(data);
    } catch (error) {
      console.error('Failed to fetch fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedFee) return;
    setPaymentProcessing(true);

    try {
      // Create order on backend
      const orderData = await paymentApi.createOrder(selectedFee.id, Number(selectedFee.amount));

      // Initialize Razorpay
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: orderData.name,
        description: orderData.description,
        order_id: orderData.order_id,
        prefill: {
          email: orderData.prefill_email || '',
          contact: orderData.prefill_contact || '',
        },
        theme: {
          color: '#ea580c', // Primary saffron color
        },
        handler: async function (response: any) {
          // Verify payment on backend
          try {
            const result = await paymentApi.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              selectedFee.id
            );

            if (result.success) {
              alert(`Payment successful! Receipt: ${result.receipt_number}`);
              setSelectedFee(null);
              fetchFees();
            }
          } catch (error) {
            alert('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: function () {
            setPaymentProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      alert(error.message || 'Failed to initiate payment. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const summaryCards = [
    { title: 'Total Fees', value: feeSummary?.total_fees || 0, color: 'bg-blue-100 text-blue-600' },
    { title: 'Total Paid', value: feeSummary?.total_paid || 0, color: 'bg-green-100 text-green-600' },
    { title: 'Pending', value: feeSummary?.total_pending || 0, color: 'bg-yellow-100 text-yellow-600' },
    { title: 'Overdue', value: feeSummary?.overdue_amount || 0, color: 'bg-red-100 text-red-600' },
  ];

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
        <p className="text-gray-600">View and pay fees for your children</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.title} variant="elevated">
            <CardContent>
              <p className="text-sm text-gray-600 mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(card.value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fee List */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-primary-600" />
            Fee Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {feeSummary?.fees && feeSummary.fees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Student</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Fee Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Due Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {feeSummary.fees.map((fee) => (
                    <tr key={fee.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900">{fee.student_name}</td>
                      <td className="px-4 py-3 text-gray-600 capitalize">{fee.fee_type}</td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(Number(fee.amount))}</td>
                      <td className="px-4 py-3 text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(fee.due_date)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(fee.status)}`}>
                          {fee.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {fee.status !== 'paid' && (
                          <Button size="sm" onClick={() => setSelectedFee(fee)}>
                            Pay Now
                          </Button>
                        )}
                        {fee.status === 'paid' && fee.receipt_number && (
                          <span className="text-green-600 text-sm flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {fee.receipt_number}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No fee records found</p>
          )}
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <Modal
        isOpen={!!selectedFee}
        onClose={() => setSelectedFee(null)}
        title="Pay Fee"
        size="md"
      >
        {selectedFee && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Student</span>
                <span className="font-medium">{selectedFee.student_name}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Fee Type</span>
                <span className="font-medium capitalize">{selectedFee.fee_type}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Amount</span>
                <span className="font-bold text-lg">{formatCurrency(Number(selectedFee.amount))}</span>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="border rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Payment Methods Accepted:</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                  <CreditCard className="w-6 h-6 text-gray-600 mb-1" />
                  <span className="text-xs text-gray-600">Cards</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                  <Smartphone className="w-6 h-6 text-gray-600 mb-1" />
                  <span className="text-xs text-gray-600">UPI</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                  <Building2 className="w-6 h-6 text-gray-600 mb-1" />
                  <span className="text-xs text-gray-600">Net Banking</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
              <Shield className="w-4 h-4 mr-1" />
              Secured by Razorpay
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedFee(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handlePayment}
                isLoading={paymentProcessing}
              >
                Pay {formatCurrency(Number(selectedFee.amount))}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
    </>
  );
}
