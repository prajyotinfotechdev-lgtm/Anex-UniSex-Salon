'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomerProfile } from '@/components/providers/CustomerProfileContext';
import { OnboardingCard } from '@/components/onboarding/onboarding-card';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, LogOut, ChevronRight, Settings, Star, CreditCard, Shield, Sparkles, Check, X, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { getFullApiUrl } from '@/lib/api';
import { useDashboard } from '@/hooks/use-dashboard';
import { usePushNotifications } from '@/hooks/use-push-notifications';

export default function ProfilePage() {
  const { profile, isGuest, clearProfile, updateProfileLocally } = useCustomerProfile();
  const { permission, subscription, subscribeToPush, unsubscribeFromPush } = usePushNotifications();
  const { data } = useDashboard();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [editForm, setEditForm] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    email: profile?.email || '',
    gender: profile?.gender || ''
  });

  // Re-sync form if profile changes (like after login)
  React.useEffect(() => {
    if (profile) {
      setEditForm({
        firstName: profile.firstName,
        lastName: profile.lastName || '',
        email: profile.email || '',
        gender: profile.gender || ''
      });
    }
  }, [profile]);

  const handleSignOut = () => {
    clearProfile();
    toast.success('Signed out successfully');
  };

  const handleSaveProfile = async () => {
    if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
      toast.error('First and last name are required');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('anex_device_token');
      const res = await fetch(getFullApiUrl('/api/v1/me/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      if (!res.ok) {
        throw new Error('Failed to update profile');
      }

      updateProfileLocally(editForm);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Could not save profile changes');
    } finally {
      setIsLoading(false);
    }
  };

  if (isGuest) {
    return (
      <div className="flex-1 pb-32 flex flex-col items-center justify-center p-6 text-center min-h-[70vh]">
        <AnimatePresence>
          {showOnboarding && <OnboardingCard onClose={() => setShowOnboarding(false)} />}
        </AnimatePresence>
        
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-serif font-medium text-white tracking-tight mb-2">
          Your Premium Profile
        </h1>
        <p className="text-muted-foreground mb-8 max-w-sm">
          Sign in or create an account to manage your appointments, view loyalty points, and personalize your salon experience.
        </p>
        
        <Button 
          onClick={() => setShowOnboarding(true)}
          className="h-14 px-8 rounded-2xl bg-white text-black hover:bg-zinc-200 font-semibold shadow-xl shadow-white/5"
        >
          Sign in or Register
        </Button>
      </div>
    );
  }

  // Get initials for Avatar
  const getInitials = () => {
    if (!profile) return 'G';
    const first = profile.firstName?.charAt(0) || '';
    const last = profile.lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  return (
    <div className="flex-1 pb-32 p-6 pt-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif font-medium text-white tracking-tight">Profile</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsEditing(!isEditing)}
          className={`rounded-full h-10 w-10 ${isEditing ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10'}`}
        >
          {isEditing ? <X className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
        </Button>
      </div>

      {/* Hero Avatar & Name */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-10"
      >
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-secondary to-background border border-border/50 flex items-center justify-center text-3xl font-serif text-white shadow-2xl mb-4">
            {getInitials()}
          </div>
          <div className="absolute bottom-4 right-0 w-8 h-8 rounded-full bg-primary border-4 border-black flex items-center justify-center">
            <Check className="w-3 h-3 text-black" strokeWidth={4} />
          </div>
        </div>
        
        {isEditing ? (
          <div className="w-full max-w-sm space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input 
                type="text" 
                value={editForm.firstName}
                onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))}
                placeholder="First Name"
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-center"
              />
              <input 
                type="text" 
                value={editForm.lastName}
                onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))}
                placeholder="Last Name"
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-center"
              />
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-white mb-1">{profile?.firstName} {profile?.lastName}</h2>
            <p className="text-muted-foreground text-sm flex items-center gap-1.5 mb-4">
              <Shield className="w-3.5 h-3.5" /> Premium Member
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditing(true)}
              className="rounded-full bg-transparent border-border text-foreground hover:text-white hover:bg-secondary h-8 px-4 text-xs"
            >
              Edit Profile
            </Button>
          </>
        )}
      </motion.div>



      {/* Contact Info Details */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Contact Information</h3>
          <div className="bg-card/50 border border-border rounded-3xl overflow-hidden backdrop-blur-sm">
            
            {/* Phone */}
            <div className="p-4 flex items-center gap-4 border-b border-border">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-0.5">Mobile Number</p>
                <p className="text-sm text-foreground font-medium">{profile?.primaryPhone}</p>
              </div>
              {isEditing && (
                <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-bold bg-card px-2 py-1 rounded">Locked</span>
              )}
            </div>

            {/* Email */}
            <div className="p-4 flex items-center gap-4 border-b border-border">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-0.5">Email Address</p>
                {isEditing ? (
                  <input 
                    type="email"
                    value={editForm.email}
                    onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="Enter email"
                    className="w-full bg-transparent text-sm text-white focus:outline-none placeholder:text-zinc-700"
                  />
                ) : (
                  <p className="text-sm text-foreground font-medium">{profile?.email || 'Not provided'}</p>
                )}
              </div>
            </div>

            {/* Gender */}
            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Gender</p>
                  {isEditing ? (
                    <select 
                      value={editForm.gender}
                      onChange={e => setEditForm(f => ({ ...f, gender: e.target.value }))}
                      className="bg-transparent text-sm text-white focus:outline-none appearance-none"
                    >
                      <option value="" className="bg-card">Not specified</option>
                      <option value="MALE" className="bg-card">Male</option>
                      <option value="FEMALE" className="bg-card">Female</option>
                      <option value="OTHER" className="bg-card">Other</option>
                    </select>
                  ) : (
                    <p className="text-sm text-foreground font-medium">
                      {profile?.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1).toLowerCase() : 'Not provided'}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* App Settings */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4 mt-8">App Settings</h3>
          <div className="bg-card/50 border border-border rounded-3xl overflow-hidden backdrop-blur-sm">
            
            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground font-medium mb-0.5">Push Notifications</p>
                <p className="text-xs text-muted-foreground">Receive offers and reminders</p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={async () => {
                    if (permission === 'granted' && subscription) {
                      await unsubscribeFromPush(profile?.id || '');
                    } else {
                      await subscribeToPush(profile?.id || '');
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 ${
                    permission === 'granted' && subscription ? 'bg-primary' : 'bg-zinc-700'
                  }`}
                  role="switch"
                  aria-checked={permission === 'granted' && subscription ? 'true' : 'false'}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      permission === 'granted' && subscription ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

          </div>
        </div>

        {isEditing ? (
          <Button 
            onClick={handleSaveProfile}
            disabled={isLoading}
            className="w-full h-14 rounded-2xl bg-white text-black hover:bg-zinc-200 font-semibold"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        ) : (
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-between p-4 bg-card/50 border border-border rounded-2xl hover:bg-card/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 group-hover:bg-red-500/20 transition-colors">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-red-400">Sign Out</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </button>
        )}
      </motion.div>
    </div>
  );
}
