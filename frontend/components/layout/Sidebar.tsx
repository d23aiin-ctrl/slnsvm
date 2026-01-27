'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Link, usePathname } from '@/navigation';
import {
  LayoutDashboard, Users, BookOpen, Calendar, FileText, CreditCard,
  Bell, Settings, LogOut, ChevronLeft, ChevronRight, GraduationCap,
  ClipboardList, BarChart3, UserCheck, MessageSquare, Clock, FileSpreadsheet, UserCog, User
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: Record<UserRole, NavItem[]> = {
  student: [
    { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
    { name: 'Timetable', href: '/student/timetable', icon: Calendar },
    { name: 'Assignments', href: '/student/assignments', icon: FileText },
    { name: 'Attendance', href: '/student/attendance', icon: UserCheck },
    { name: 'Exams', href: '/student/exams', icon: FileSpreadsheet },
    { name: 'Results', href: '/student/results', icon: BarChart3 },
    { name: 'Fees', href: '/student/fees', icon: CreditCard },
    { name: 'Messages', href: '/student/messages', icon: MessageSquare },
    { name: 'Notices', href: '/student/notices', icon: Bell },
    { name: 'My Profile', href: '/student/profile', icon: User },
  ],
  parent: [
    { name: 'Dashboard', href: '/parent', icon: LayoutDashboard },
    { name: 'Children', href: '/parent/children', icon: Users },
    { name: 'Attendance', href: '/parent/attendance', icon: UserCheck },
    { name: 'Timetable', href: '/parent/timetable', icon: Calendar },
    { name: 'Assignments', href: '/parent/assignments', icon: FileText },
    { name: 'Results', href: '/parent/results', icon: BarChart3 },
    { name: 'Fees', href: '/parent/fees', icon: CreditCard },
    { name: 'Messages', href: '/parent/messages', icon: MessageSquare },
    { name: 'Notices', href: '/parent/notices', icon: Bell },
  ],
  teacher: [
    { name: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
    { name: 'My Classes', href: '/teacher/classes', icon: Users },
    { name: 'Timetable', href: '/teacher/timetable', icon: Clock },
    { name: 'Assignments', href: '/teacher/assignments', icon: FileText },
    { name: 'Attendance', href: '/teacher/attendance', icon: ClipboardList },
    { name: 'Marks Entry', href: '/teacher/marks', icon: BarChart3 },
    { name: 'Messages', href: '/teacher/messages', icon: MessageSquare },
    { name: 'Notices', href: '/teacher/notices', icon: Bell },
    { name: 'My Profile', href: '/teacher/profile', icon: User },
  ],
  admin: [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Students', href: '/admin/students', icon: Users },
    { name: 'Teachers', href: '/admin/teachers', icon: GraduationCap },
    { name: 'Classes', href: '/admin/classes', icon: BookOpen },
    { name: 'Attendance', href: '/admin/attendance', icon: UserCheck },
    { name: 'Timetable', href: '/admin/timetable', icon: Clock },
    { name: 'Exams', href: '/admin/exams', icon: FileSpreadsheet },
    { name: 'Fees', href: '/admin/fees', icon: CreditCard },
    { name: 'Admissions', href: '/admin/admissions', icon: ClipboardList },
    { name: 'Notices', href: '/admin/notices', icon: Bell },
    { name: 'Admin Users', href: '/admin/users', icon: UserCog },
    { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
  ],
};

interface SidebarProps {
  userRole: UserRole;
}

export default function Sidebar({ userRole }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const items = navItems[userRole] || [];

  return (
    <aside
      className={cn(
        'bg-white border-r border-gray-200 h-screen sticky top-0 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          {!collapsed ? (
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full"
              />
              <span className="text-sm font-bold text-gray-900 leading-tight">सरस्वती विद्या<br />मन्दिर</span>
            </Link>
          ) : (
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full"
              />
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center px-3 py-2 rounded-lg transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <item.icon className={cn('h-5 w-5', collapsed ? '' : 'mr-3')} />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="border-t p-4">
          {!collapsed && user && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          )}
          <button
            onClick={logout}
            className={cn(
              'flex items-center w-full px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors',
              collapsed ? 'justify-center' : ''
            )}
          >
            <LogOut className={cn('h-5 w-5', collapsed ? '' : 'mr-3')} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
