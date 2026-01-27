'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout allowedRoles={['parent']}>
      {children}
    </DashboardLayout>
  );
}
