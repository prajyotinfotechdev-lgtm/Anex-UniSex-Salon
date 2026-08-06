'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Send, BellRing, Users } from 'lucide-react';
import { PremiumLoader } from '@/components/ui/premium-loader';

type NotificationForm = {
  title: string;
  body: string;
  url: string;
  target: 'all' | 'specific';
};

export default function NotificationsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<NotificationForm>({
    defaultValues: {
      title: '',
      body: '',
      url: '/',
      target: 'all',
    }
  });

  const target = watch('target');

  const onSubmit = async (data: NotificationForm) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          customerIds: [] // Expand this if you add a customer multi-select later
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send notification');
      }

      toast({
        title: "Success",
        description: `Notification dispatched successfully to ${result.sent} devices.`,
      });
      reset();
    } catch (err: any) {
      toast({
        title: "Broadcast Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Push Notifications</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Main Form */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Broadcast Message
            </CardTitle>
            <CardDescription>
              Instantly send a push notification to your customers' devices. 
              This will wake up their device and show a native banner.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <PremiumLoader size="lg" />
                <p className="text-muted-foreground animate-pulse">Dispatching to network...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Notification Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g. Flash Sale! 20% Off Today" 
                    {...register('title', { required: 'Title is required' })} 
                    className={errors.title ? 'border-destructive' : ''}
                  />
                  {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body">Message Body</Label>
                  <Textarea 
                    id="body" 
                    placeholder="e.g. Book an appointment in the next 2 hours to claim your discount." 
                    rows={4}
                    {...register('body', { required: 'Message body is required' })}
                    className={errors.body ? 'border-destructive' : ''}
                  />
                  {errors.body && <p className="text-sm text-destructive">{errors.body.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="url">Action URL Path</Label>
                    <Input 
                      id="url" 
                      placeholder="/book" 
                      {...register('url')} 
                    />
                    <p className="text-xs text-muted-foreground">Where they go when they tap.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target">Audience</Label>
                    <Select defaultValue={target} onValueChange={(val: any) => setValue('target', val)}>
                      <SelectTrigger id="target">
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subscribed Users</SelectItem>
                        <SelectItem value="specific" disabled>Specific Customers (Coming Soon)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  <BellRing className="mr-2 h-4 w-4" /> Send Broadcast
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Live Preview */}
        <Card className="col-span-1 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Live Preview</CardTitle>
            <CardDescription>How it appears on a mobile device</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-8">
            <div className="relative w-[280px] h-[120px] bg-background border shadow-xl rounded-2xl p-4 overflow-hidden">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
                  <span className="text-primary-foreground font-bold text-xl">A</span>
                </div>
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">Anex Salon • now</p>
                  </div>
                  <h4 className="text-sm font-bold truncate">
                    {watch('title') || 'Notification Title'}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-tight">
                    {watch('body') || 'The message body will appear here, giving customers the details.'}
                  </p>
                </div>
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-muted rounded-b-xl"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
