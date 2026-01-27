'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, GraduationCap, Calendar, Phone, MapPin } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Child {
  id: number;
  name: string;
  admission_no: string;
  class_name?: string;
  section?: string;
  roll_no?: number;
  dob?: string;
  gender?: string;
  phone?: string;
  address?: string;
  blood_group?: string;
  profile_image?: string;
}

export default function ParentChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const response = await api.get('/parents/children');
      setChildren(response.data);
    } catch (error) {
      console.error('Failed to fetch children:', error);
    } finally {
      setLoading(false);
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
        <h1 className="text-2xl font-bold text-gray-900">My Children</h1>
        <p className="text-gray-600">View your children&apos;s information</p>
      </div>

      {children.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No children linked to your account</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children.map((child) => (
            <Card key={child.id} variant="elevated">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{child.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">Adm. No: {child.admission_no}</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        <span>{child.class_name || 'N/A'} - Section {child.section || 'N/A'}</span>
                      </div>
                      {child.roll_no && (
                        <div className="flex items-center text-gray-600">
                          <span className="w-4 h-4 mr-2 text-center font-bold">#</span>
                          <span>Roll No: {child.roll_no}</span>
                        </div>
                      )}
                      {child.dob && (
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>DOB: {formatDate(child.dob)}</span>
                        </div>
                      )}
                      {child.phone && (
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          <span>{child.phone}</span>
                        </div>
                      )}
                      {child.blood_group && (
                        <div className="flex items-center text-gray-600">
                          <span className="w-4 h-4 mr-2 text-red-500 font-bold text-xs">B+</span>
                          <span>Blood Group: {child.blood_group}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
