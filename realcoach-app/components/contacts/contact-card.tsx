'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PipelineBadge } from './pipeline-badge';
import { Phone, Mail, Clock, Flame, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Contact } from '@/lib/database.types';
import { cn } from '@/lib/utils';

interface ContactCardProps {
  contact: Contact;
  onDelete?: (id: string) => void;
  variant?: 'default' | 'compact';
}

export function ContactCard({ contact, onDelete, variant = 'default' }: ContactCardProps) {
  const initials = contact.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const getMotivationColor = (level: string | null) => {
    switch (level) {
      case 'High':
        return 'text-green-600 bg-green-50';
      case 'Medium':
        return 'text-amber-600 bg-amber-50';
      case 'Low':
        return 'text-slate-600 bg-slate-50';
      default:
        return 'text-slate-400 bg-slate-50';
    }
  };

  const formatDaysSince = (days: number) => {
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  if (variant === 'compact') {
    return (
      <Link href={`/contacts/${contact.id}`}>
        <Card className="p-3 hover:bg-slate-50 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{contact.name}</p>
              <p className="text-xs text-slate-500">
                {contact.days_since_contact > 0
                  ? formatDaysSince(contact.days_since_contact)
                  : 'No contact yet'}
              </p>
            </div>
            <PipelineBadge stage={contact.pipeline_stage} size="sm" />
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <Link href={`/contacts/${contact.id}`}>
          <Avatar className="h-12 w-12 cursor-pointer">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link href={`/contacts/${contact.id}`}>
                <h3 className="font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                  {contact.name}
                </h3>
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <PipelineBadge stage={contact.pipeline_stage} size="sm" />
                {contact.motivation_level && (
                  <Badge
                    variant="outline"
                    className={cn('text-xs border-0', getMotivationColor(contact.motivation_level))}
                  >
                    {contact.motivation_level} Motivation
                  </Badge>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/contacts/${contact.id}`}>View Details</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/contacts/${contact.id}/edit`}>Edit Contact</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => onDelete?.(contact.id)}
                >
                  Delete Contact
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Contact Info */}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-600">
            {contact.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>{contact.phone}</span>
              </div>
            )}
            {contact.email && (
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span className="truncate max-w-[200px]">{contact.email}</span>
              </div>
            )}
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 mt-3">
            {/* Priority Score */}
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-16 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${contact.priority_score}%` }}
                />
              </div>
              <span className="text-xs text-slate-500">{contact.priority_score}/100</span>
            </div>

            {/* Days Since Contact */}
            <div className="flex items-center gap-1.5 text-xs">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span
                className={cn(
                  contact.seven_day_rule_flag ? 'text-red-600 font-medium' : 'text-slate-500'
                )}
              >
                {contact.days_since_contact > 0
                  ? formatDaysSince(contact.days_since_contact)
                  : 'No contact yet'}
              </span>
              {contact.seven_day_rule_flag && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                  7-day rule
                </Badge>
              )}
            </div>

            {/* Timeframe */}
            {contact.timeframe && (
              <Badge variant="outline" className="text-xs">
                {contact.timeframe}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
