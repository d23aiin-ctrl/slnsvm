'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { teacherApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Calendar, BookOpen, Users, Save } from 'lucide-react';

interface TeacherProfile {
  id: number;
  user_id: number;
  email: string;
  employee_id: string;
  name: string;
  phone?: string;
  qualification?: string;
  experience_years?: number;
  join_date?: string;
  address?: string;
  profile_image?: string;
  classes: { id: number; name: string; section?: string }[];
  subjects: { id: number; name: string; code: string }[];
}

export default function TeacherProfilePage() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await teacherApi.getProfile();
      setProfile(data);
      setFormData({
        phone: data.phone || '',
        address: data.address || ''
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await teacherApi.updateProfile({
        phone: formData.phone || undefined,
        address: formData.address || undefined
      });
      await fetchProfile();
      setEditing(false);
    } catch (error) {
      alert('Failed to update profile');
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

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">View and update your profile information</p>
        </div>
        {!editing ? (
          <Button onClick={() => setEditing(true)}>
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              setEditing(false);
              setFormData({
                phone: profile.phone || '',
                address: profile.address || ''
              });
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={saving}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card variant="elevated" className="lg:col-span-1">
          <CardContent className="p-6 text-center">
            <div className="w-24 h-24 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              {profile.profile_image ? (
                <Image
                  src={profile.profile_image}
                  alt={profile.name}
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <User className="w-12 h-12 text-primary-600" />
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
            <p className="text-gray-500">{profile.employee_id}</p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-center text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                {profile.email}
              </div>
              {profile.phone && (
                <div className="flex items-center justify-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {profile.phone}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card variant="elevated" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-4">
                <Input
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter address"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Note: Contact admin to update other details like name, qualification, etc.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <GraduationCap className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Qualification</p>
                    <p className="font-medium">{profile.qualification || 'Not specified'}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Briefcase className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="font-medium">
                      {profile.experience_years ? `${profile.experience_years} years` : 'Not specified'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Join Date</p>
                    <p className="font-medium">
                      {profile.join_date ? formatDate(profile.join_date) : 'Not specified'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{profile.phone || 'Not specified'}</p>
                  </div>
                </div>
                <div className="flex items-start md:col-span-2">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{profile.address || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Classes Card */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-primary-600" />
              Assigned Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile.classes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.classes.map(cls => (
                  <span
                    key={cls.id}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {cls.name} {cls.section || ''}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No classes assigned</p>
            )}
          </CardContent>
        </Card>

        {/* Subjects Card */}
        <Card variant="elevated" className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-primary-600" />
              Teaching Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile.subjects.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.subjects.map(sub => (
                  <span
                    key={sub.id}
                    className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium"
                  >
                    {sub.name} ({sub.code})
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No subjects assigned</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
