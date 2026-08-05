'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, ArrowRight, User, Phone, Mail, ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useCustomerProfile, getOrCreateDeviceId } from '@/components/providers/CustomerProfileContext';
import { getFullApiUrl } from '@/lib/api';

const ORG_ID = process.env.NEXT_PUBLIC_ORGANIZATION_ID || '10fdbe22-4c40-4bd6-8266-9a3c49f9ed8b';

type Step = 'PHONE' | 'PROFILE' | 'CONFIRM_IDENTITY' | 'WELCOME_BACK';

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? 60 : -60, opacity: 0 }),
};

export function OnboardingCard({ onClose }: { onClose?: () => void }) {
  const { saveProfile } = useCustomerProfile();
  const [step, setStep] = useState<Step>('PHONE');
  const [direction, setDirection] = useState(1);
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [welcomeBackName, setWelcomeBackName] = useState('');
  const [pendingProfile, setPendingProfile] = useState<any>(null);

  const goToStep = (nextStep: Step, dir = 1) => {
    setDirection(dir);
    setStep(nextStep);
  };

  const handlePhoneSubmit = async () => {
    const raw = phone.replace(/\D/g, '');
    if (raw.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    const normalizedPhone = raw.startsWith('91') && raw.length === 12 ? `+${raw}` : `+91${raw.slice(-10)}`;

    setIsLoading(true);
    try {
      // Probe: call onboard with phone only to check if user exists
      const deviceId = getOrCreateDeviceId();
      const res = await fetch(getFullApiUrl('/api/v1/customer/onboard'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: normalizedPhone,
          organizationId: ORG_ID,
          deviceId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      if (!data.isNewCustomer) {
        // Returning user - ask for confirmation first
        const profile = {
          id: data.customer.id,
          firstName: data.customer.firstName,
          lastName: data.customer.lastName || '',
          primaryPhone: data.customer.primaryPhone,
          email: data.customer.email,
          gender: data.customer.gender,
          deviceToken: data.deviceToken,
        };
        setPendingProfile(profile);
        setWelcomeBackName(data.customer.firstName);
        goToStep('CONFIRM_IDENTITY');
      } else {
        // New user - collect profile details
        goToStep('PROFILE');
      }
    } catch (err: any) {
      toast.error(err.message || 'Could not verify your number. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmIdentity = () => {
    if (pendingProfile) {
      saveProfile(pendingProfile);
      goToStep('WELCOME_BACK');
      setTimeout(() => {
        onClose?.();
      }, 2000);
    }
  };

  const handleProfileSubmit = async () => {
    if (!firstName.trim()) {
      toast.error('First name is required');
      return;
    }
    if (!lastName.trim()) {
      toast.error('Last name is required');
      return;
    }

    const raw = phone.replace(/\D/g, '');
    const normalizedPhone = raw.startsWith('91') && raw.length === 12 ? `+${raw}` : `+91${raw.slice(-10)}`;
    const deviceId = getOrCreateDeviceId();

    setIsLoading(true);
    try {
      const res = await fetch(getFullApiUrl('/api/v1/customer/onboard'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: normalizedPhone,
          organizationId: ORG_ID,
          deviceId,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim() || null,
          gender: gender || null,
          deviceName: navigator.userAgent.substring(0, 100),
          platform: 'web',
          browser: navigator.userAgent.substring(0, 50),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong');

      const profile = {
        id: data.customer.id,
        firstName: data.customer.firstName,
        lastName: data.customer.lastName || '',
        primaryPhone: data.customer.primaryPhone,
        email: data.customer.email,
        gender: data.customer.gender,
        deviceToken: data.deviceToken,
      };
      saveProfile(profile);
      setWelcomeBackName(data.customer.firstName);
      goToStep('WELCOME_BACK');

      setTimeout(() => {
        onClose?.();
      }, 2000);
    } catch (err: any) {
      toast.error(err.message || 'Could not create your profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center p-4 pt-20 sm:p-0">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Card */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative w-full sm:max-w-md bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Premium top accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        <div className="absolute top-0 left-1/4 right-1/4 h-12 bg-primary/5 blur-2xl" />

        <div className="p-8 pt-10 min-h-[420px] flex flex-col">
          <AnimatePresence mode="wait" custom={direction}>
            {/* --- STEP: PHONE --- */}
            {step === 'PHONE' && (
              <motion.div
                key="phone"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                className="flex flex-col flex-1"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Welcome to</p>
                    <h2 className="text-xl font-serif font-semibold text-white">Anex Salon</h2>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-1">Let's get started</h3>
                <p className="text-zinc-400 text-sm mb-8">Enter your mobile number to continue your premium experience.</p>

                <div className="relative mb-6">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-zinc-500" />
                    <span className="text-zinc-400 text-sm font-medium">+91</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="Enter mobile number"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    onKeyDown={e => e.key === 'Enter' && handlePhoneSubmit()}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-24 pr-4 py-4 text-white text-lg placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                    autoFocus
                  />
                </div>

                <Button
                  onClick={handlePhoneSubmit}
                  disabled={isLoading || phone.replace(/\D/g, '').length < 10}
                  className="w-full h-14 rounded-2xl text-base font-semibold mt-auto bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Checking...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Continue <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>

                <p className="text-center text-xs text-zinc-600 mt-4">
                  By continuing, you agree to our Terms & Privacy Policy
                </p>
              </motion.div>
            )}

            {/* --- STEP: PROFILE --- */}
            {step === 'PROFILE' && (
              <motion.div
                key="profile"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                className="flex flex-col flex-1"
              >
                <button
                  onClick={() => goToStep('PHONE', -1)}
                  className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300 text-sm mb-6 transition-colors w-fit"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Let's Create Your Profile</h3>
                    <p className="text-zinc-500 text-xs">We'll personalise your experience</p>
                  </div>
                </div>

                <div className="space-y-3 flex-1">
                  {/* First Name & Last Name */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-zinc-500 mb-1.5 block font-medium">First Name *</label>
                      <input
                        type="text"
                        placeholder="Raj"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 mb-1.5 block font-medium">Last Name *</label>
                      <input
                        type="text"
                        placeholder="Sharma"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs text-zinc-500 mb-1.5 block font-medium">Email (optional)</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input
                        type="email"
                        placeholder="raj@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="text-xs text-zinc-500 mb-2 block font-medium">Gender (optional)</label>
                    <div className="flex gap-2">
                      {(['MALE', 'FEMALE', 'OTHER'] as const).map(g => (
                        <button
                          key={g}
                          onClick={() => setGender(prev => prev === g ? '' : g)}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                            gender === g
                              ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600'
                          }`}
                        >
                          {g === 'MALE' ? '♂ Male' : g === 'FEMALE' ? '♀ Female' : '⚬ Other'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleProfileSubmit}
                  disabled={isLoading || !firstName.trim() || !lastName.trim()}
                  className="w-full h-14 rounded-2xl text-base font-semibold mt-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating profile...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Save & Enter <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </motion.div>
            )}

            {/* --- STEP: CONFIRM IDENTITY --- */}
            {step === 'CONFIRM_IDENTITY' && (
              <motion.div
                key="confirm"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                className="flex flex-col flex-1 items-center justify-center text-center gap-6"
              >
                <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center mb-2">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Welcome back, {welcomeBackName}!
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    Is this you?
                  </p>
                </div>
                
                <div className="w-full flex flex-col gap-3 mt-4">
                  <Button
                    onClick={handleConfirmIdentity}
                    className="w-full h-14 rounded-2xl text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                  >
                    Yes, log me in
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPendingProfile(null);
                      goToStep('PHONE', -1);
                    }}
                    className="w-full h-14 rounded-2xl text-base font-semibold border-zinc-800 text-white hover:bg-zinc-900"
                  >
                    No, this is not me
                  </Button>
                </div>
              </motion.div>
            )}

            {/* --- STEP: WELCOME BACK --- */}
            {step === 'WELCOME_BACK' && (
              <motion.div
                key="welcome"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                className="flex flex-col flex-1 items-center justify-center text-center gap-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center"
                >
                  <Check className="w-10 h-10 text-primary" />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    Welcome, {welcomeBackName}! ✨
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    Your premium salon experience awaits.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
