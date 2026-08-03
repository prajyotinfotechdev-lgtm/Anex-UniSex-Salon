import { ReactNode } from 'react';
import Link from 'next/link';
import { Settings, Puzzle, Palette, Receipt, Clock, Building2, Percent } from 'lucide-react';
import { Card } from '@/components/ui/card';

const SETTINGS_NAV = [
  { name: 'General', href: '/settings', icon: Settings },
  { name: 'Branches', href: '/settings/branches', icon: Building2 },
  { name: 'Module Registry', href: '/settings/modules', icon: Puzzle },
  { name: 'Branding', href: '/settings/branding', icon: Palette },
  { name: 'Invoices', href: '/settings/invoices', icon: Receipt },
  { name: 'Taxes', href: '/settings/taxes', icon: Percent },
  { name: 'Working Hours', href: '/settings/hours', icon: Clock },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your organization profile, modules, and billing configuration.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <Card className="w-full md:w-64 shrink-0 p-2 h-fit">
          <nav className="flex flex-col space-y-1">
            {SETTINGS_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-accent text-sm font-medium transition-colors"
              >
                <item.icon className="h-4 w-4 text-muted-foreground" />
                {item.name}
              </Link>
            ))}
          </nav>
        </Card>

        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
