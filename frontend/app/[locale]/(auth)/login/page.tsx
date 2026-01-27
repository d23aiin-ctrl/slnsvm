'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Link } from '@/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth, getRedirectPath } from '@/lib/auth';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, user, checkAuth } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirect = searchParams.get('redirect') || getRedirectPath(user.role);
      router.push(redirect);
    }
  }, [isAuthenticated, user, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="elevated">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <p className="text-gray-600 mt-2">Sign in to access your portal</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/admissions" className="text-primary-600 hover:text-primary-700 font-medium">
              Apply for Admission
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 pt-6 border-t">
          <p className="text-xs text-gray-500 text-center mb-3">Demo Credentials (Click to fill)</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => { setEmail('student@slnsvm.com'); setPassword('demo123'); }}
              className="bg-blue-50 hover:bg-blue-100 p-2 rounded text-left transition-colors border border-blue-200"
            >
              <p className="font-medium text-blue-700">Student</p>
              <p className="text-blue-600">student@slnsvm.com</p>
            </button>
            <button
              type="button"
              onClick={() => { setEmail('parent@slnsvm.com'); setPassword('demo123'); }}
              className="bg-green-50 hover:bg-green-100 p-2 rounded text-left transition-colors border border-green-200"
            >
              <p className="font-medium text-green-700">Parent</p>
              <p className="text-green-600">parent@slnsvm.com</p>
            </button>
            <button
              type="button"
              onClick={() => { setEmail('teacher@slnsvm.com'); setPassword('demo123'); }}
              className="bg-purple-50 hover:bg-purple-100 p-2 rounded text-left transition-colors border border-purple-200"
            >
              <p className="font-medium text-purple-700">Teacher</p>
              <p className="text-purple-600">teacher@slnsvm.com</p>
            </button>
            <button
              type="button"
              onClick={() => { setEmail('admin@slnsvm.com'); setPassword('demo123'); }}
              className="bg-orange-50 hover:bg-orange-100 p-2 rounded text-left transition-colors border border-orange-200"
            >
              <p className="font-medium text-orange-700">Admin</p>
              <p className="text-orange-600">admin@slnsvm.com</p>
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">Password: <code className="bg-gray-100 px-1 rounded">demo123</code></p>
        </div>
      </CardContent>
    </Card>
  );
}
