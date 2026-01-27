'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { CheckCircle, FileText, Calendar, CreditCard } from 'lucide-react';
import { admissionApi } from '@/lib/api';

const steps = [
  { icon: FileText, title: 'Submit Application', description: 'Fill out the online application form with required details' },
  { icon: Calendar, title: 'Entrance Test', description: 'Appear for the entrance test on scheduled date' },
  { icon: CheckCircle, title: 'Document Verification', description: 'Submit required documents for verification' },
  { icon: CreditCard, title: 'Fee Payment', description: 'Complete the admission fee payment' },
];

const documents = [
  'Birth Certificate',
  'Transfer Certificate (if applicable)',
  'Report Card of previous class',
  'Passport size photographs (4)',
  'Aadhar Card (Student & Parents)',
  'Address Proof',
  'Caste Certificate (if applicable)',
];

const feeStructure = [
  { class: 'Nursery - KG', admission: '15,000', tuition: '3,000/month' },
  { class: 'Class I - V', admission: '20,000', tuition: '3,500/month' },
  { class: 'Class VI - VIII', admission: '25,000', tuition: '4,000/month' },
  { class: 'Class IX - X', admission: '30,000', tuition: '4,500/month' },
  { class: 'Class XI - XII', admission: '35,000', tuition: '5,000/month' },
];

export default function AdmissionsPage() {
  const [formData, setFormData] = useState({
    student_name: '',
    parent_name: '',
    parent_phone: '',
    parent_email: '',
    class_interested: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await admissionApi.submitInquiry(formData);
      setSubmitted(true);
    } catch (error) {
      alert('Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Admissions 2025-26</h1>
          <p className="text-xl text-primary-100 max-w-3xl">
            Join the SLNSVM family and begin your journey towards excellence.
            Applications are now open for the upcoming academic year.
          </p>
        </div>
      </section>

      {/* Admission Process */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Admission Process</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={step.title} className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <div className="absolute -top-2 -left-2 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gray-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry Form & Fee Structure */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Inquiry Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Admission Inquiry</h2>
              {submitted ? (
                <Card variant="elevated" className="bg-green-50">
                  <CardContent className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-green-900 mb-2">
                      Inquiry Submitted Successfully!
                    </h3>
                    <p className="text-green-700">
                      We have received your inquiry. Our admissions team will contact you shortly.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card variant="elevated">
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <Input
                        label="Student Name"
                        value={formData.student_name}
                        onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                        required
                      />
                      <Input
                        label="Parent/Guardian Name"
                        value={formData.parent_name}
                        onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                        required
                      />
                      <Input
                        label="Phone Number"
                        type="tel"
                        value={formData.parent_phone}
                        onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                        required
                      />
                      <Input
                        label="Email Address"
                        type="email"
                        value={formData.parent_email}
                        onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Class Interested
                        </label>
                        <select
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          value={formData.class_interested}
                          onChange={(e) => setFormData({ ...formData, class_interested: e.target.value })}
                          required
                        >
                          <option value="">Select Class</option>
                          <option value="Nursery">Nursery</option>
                          <option value="LKG">LKG</option>
                          <option value="UKG">UKG</option>
                          {[...Array(12)].map((_, i) => (
                            <option key={i} value={`Class ${i + 1}`}>Class {i + 1}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Message (Optional)
                        </label>
                        <textarea
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          rows={3}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        ></textarea>
                      </div>
                      <Button type="submit" className="w-full" isLoading={isSubmitting}>
                        Submit Inquiry
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Fee Structure */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Fee Structure</h2>
              <Card variant="elevated">
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Class</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Admission Fee</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Tuition Fee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {feeStructure.map((row) => (
                        <tr key={row.class}>
                          <td className="px-4 py-3 text-sm text-gray-900">{row.class}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">Rs. {row.admission}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">Rs. {row.tuition}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
              <p className="text-sm text-gray-500 mt-4">
                * Fee structure is subject to change. Contact admissions office for current rates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Required Documents */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Required Documents</h2>
          <div className="max-w-2xl mx-auto">
            <Card variant="bordered">
              <CardContent>
                <ul className="space-y-3">
                  {documents.map((doc) => (
                    <li key={doc} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                      <span className="text-gray-700">{doc}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Important Dates */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-8">Important Dates</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <p className="text-3xl font-bold mb-2">Mar 31</p>
              <p className="text-primary-100">Application Deadline</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <p className="text-3xl font-bold mb-2">Apr 15</p>
              <p className="text-primary-100">Entrance Test</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <p className="text-3xl font-bold mb-2">Apr 30</p>
              <p className="text-primary-100">Results Declaration</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
