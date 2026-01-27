'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout allowedRoles={['teacher']}>
      {children}
    </DashboardLayout>
  );
}
