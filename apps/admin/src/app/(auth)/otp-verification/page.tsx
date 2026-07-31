import { Metadata } from 'next';
import { OTPVerificationForm } from '@/modules/auth/otp-verification-form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Verify OTP | ANEX OS',
  description: 'Verify your one-time password',
};

export default function OTPVerificationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-8 bg-background p-8 rounded-xl shadow-lg border">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Verify Code</h1>
          <p className="text-sm text-muted-foreground">
            Enter the verification code sent to your email
          </p>
        </div>
        <OTPVerificationForm />
        <div className="text-center text-sm">
          <Link href="/login" className="text-muted-foreground hover:text-primary transition-colors">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
