'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  User, Mail, Phone, Calendar, MapPin, BookOpen,
  GraduationCap, Hash, Droplet
} from 'lucide-react';
import { studentApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface StudentProfile {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  admission_no: string | null;
  roll_no: string | null;
  date_of_birth: string | null;
  gender: string | null;
  blood_group: string | null;
  address: string | null;
  class_name: string | null;
  section: string | null;
  academic_year: string | null;
  admission_date: string | null;
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await studentApi.getProfile();
      setProfile(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
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

  if (!profile) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Profile not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600">View your student profile information</p>
      </div>

      {/* Profile Header */}
      <Card variant="elevated">
        <CardContent className="py-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-primary-600" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
                <Badge variant="info">
                  {profile.class_name} - {profile.section}
                </Badge>
                {profile.roll_no && (
                  <Badge variant="default">Roll No: {profile.roll_no}</Badge>
                )}
                {profile.academic_year && (
                  <Badge variant="info">{profile.academic_year}</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2 text-primary-600" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">{profile.email}</p>
                </div>
              </div>

              {profile.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-900">{profile.phone}</p>
                  </div>
                </div>
              )}

              {profile.date_of_birth && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="text-gray-900">{formatDate(profile.date_of_birth)}</p>
                  </div>
                </div>
              )}

              {profile.gender && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="text-gray-900 capitalize">{profile.gender}</p>
                  </div>
                </div>
              )}

              {profile.blood_group && (
                <div className="flex items-start gap-3">
                  <Droplet className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Blood Group</p>
                    <p className="text-gray-900">{profile.blood_group}</p>
                  </div>
                </div>
              )}

              {profile.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-gray-900">{profile.address}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="w-5 h-5 mr-2 text-primary-600" />
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.admission_no && (
                <div className="flex items-start gap-3">
                  <Hash className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Admission Number</p>
                    <p className="text-gray-900">{profile.admission_no}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Class & Section</p>
                  <p className="text-gray-900">{profile.class_name} - {profile.section}</p>
                </div>
              </div>

              {profile.roll_no && (
                <div className="flex items-start gap-3">
                  <Hash className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Roll Number</p>
                    <p className="text-gray-900">{profile.roll_no}</p>
                  </div>
                </div>
              )}

              {profile.academic_year && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Academic Year</p>
                    <p className="text-gray-900">{profile.academic_year}</p>
                  </div>
                </div>
              )}

              {profile.admission_date && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Admission Date</p>
                    <p className="text-gray-900">{formatDate(profile.admission_date)}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact School Note */}
      <Card variant="bordered" className="border-blue-200 bg-blue-50">
        <CardContent className="py-4">
          <p className="text-sm text-blue-700">
            <strong>Need to update your information?</strong> Please contact the school administration
            to make changes to your profile details.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
