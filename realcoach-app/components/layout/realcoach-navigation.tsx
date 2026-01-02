'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkle } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Ignition', href: '/' },
  { name: 'Goals & Actions', href: '/goals' },
  { name: 'Business Plan', href: '/business-plan' },
  { name: 'Pipeline', href: '/pipeline' },
  { name: 'Production Dashboard', href: '/production' },
  { name: 'Database', href: '/database' },
];

export function RealCoachNavigation() {
  const pathname = usePathname();

  return (
    <nav className="h-15 border-b border-border bg-background px-4 lg:px-6">
      <div className="flex items-center justify-between h-full">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <Sparkle className="h-4 w-4 text-background" />
          </div>
          <span className="text-lg font-bold text-foreground">RealCoach</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'relative text-sm font-medium transition-colors py-4',
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {item.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Mobile menu button */}
        <button className="lg:hidden p-2 text-muted-foreground">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden pb-4">
        <div className="flex flex-col space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-card text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
