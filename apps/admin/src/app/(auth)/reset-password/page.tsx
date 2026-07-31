import { Metadata } from 'next';
import { Suspense } from 'react';
import { ResetPasswordForm } from '@/modules/auth/reset-password-form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Reset Password | ANEX OS',
  description: 'Set a new password',
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-8 bg-background p-8 rounded-xl shadow-lg border">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your new password below
          </p>
        </div>
        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
        <div className="text-center text-sm">
          <Link href="/login" className="text-muted-foreground hover:text-primary transition-colors">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
