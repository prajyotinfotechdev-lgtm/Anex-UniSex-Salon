'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/shared/api/auth.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const otpSchema = z.object({
  otp: z.string().min(6, 'OTP must be at least 6 characters'),
});

type OTPValues = z.infer<typeof otpSchema>;

export function OTPVerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<OTPValues>({
    resolver: zodResolver(otpSchema),
  });

  const onSubmit = async (data: OTPValues) => {
    if (!email) {
      toast.error('Email is missing. Please try again.');
      return;
    }
    
    setIsLoading(true);
    try {
      await authApi.verifyOTP({ email, otp: data.otp });
      toast.success('OTP verified. You can now reset your password.');
      // Proceed to reset password form or login
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="otp">One-Time Password</Label>
        <Input 
          id="otp" 
          type="text" 
          placeholder="123456" 
          {...register('otp')} 
        />
        {errors.otp && (
          <p className="text-sm text-red-500">{errors.otp.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Verifying...' : 'Verify OTP'}
      </Button>
    </form>
  );
}
