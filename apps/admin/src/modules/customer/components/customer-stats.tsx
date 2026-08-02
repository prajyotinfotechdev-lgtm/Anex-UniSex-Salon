'use client';

import * as React from 'react';
import { Customer } from '../customer.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { formatDate } from '@/shared/utils/date';
import {
  TrendingUp,
  CalendarCheck,
  Wallet,
  Award,
  Crown,
  Package,
  Tags
} from 'lucide-react';

export function CustomerStats({ customer }: { customer: Customer }) {
  return (
    <div className="space-y-6">

      {/* Key Metrics */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Key Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-muted-foreground">Lifetime Value</span>
            <Badge variant="secondary" className="font-mono">Coming Soon</Badge>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-muted-foreground">Total Visits</span>
            <Badge variant="secondary" className="font-mono">Coming Soon</Badge>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-muted-foreground">Avg. Ticket Value</span>
            <Badge variant="secondary" className="font-mono">Coming Soon</Badge>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Customer Since</span>
            <span className="text-sm font-medium">{formatDate(customer.createdAt)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Engagement */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-primary" />
            Engagement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-muted-foreground">Last Visit</span>
            <Badge variant="secondary">Coming Soon</Badge>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-muted-foreground">Upcoming Appt</span>
            <Badge variant="secondary">Coming Soon</Badge>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-muted-foreground">Favourite Service</span>
            <Badge variant="secondary">Coming Soon</Badge>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Favourite Provider</span>
            <Badge variant="secondary">Coming Soon</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Summaries (Coming Soon) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Wallet & Rewards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Wallet className="h-4 w-4" /> Wallet Balance
            </span>
            <Badge variant="secondary">Coming Soon</Badge>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" /> Loyalty Points
            </span>
            <Badge variant="secondary">Coming Soon</Badge>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Crown className="h-4 w-4" /> Memberships
            </span>
            <Badge variant="secondary">Coming Soon</Badge>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" /> Packages
            </span>
            <Badge variant="secondary">Coming Soon</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Tags className="h-5 w-5 text-primary" />
            Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(!customer.tags || customer.tags.length === 0) ? (
            <p className="text-sm text-muted-foreground italic">No tags assigned.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {customer.tags.map((tag: Record<string, unknown>, i: number) => (
                <Badge key={i} variant="outline">{(tag.name as string) || 'Unknown Tag'}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
