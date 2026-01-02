import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PipelineBadge } from '@/components/contacts/pipeline-badge';
import { ContactDetailClient } from '@/components/contacts/contact-detail-client';
import { StageProgress } from '@/components/contacts/stage-progress';
import {
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Target,
  DollarSign,
  Home,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import type { Contact } from '@/lib/database.types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ContactDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    notFound();
  }

  const contact = data as Contact;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getMotivationColor = (level: string | null) => {
    switch (level) {
      case 'High':
        return 'bg-green-100 text-green-700';
      case 'Medium':
        return 'bg-amber-100 text-amber-700';
      case 'Low':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-500';
    }
  };

  const initials = contact.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-2">
        <Link href="/contacts">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contacts
        </Link>
      </Button>

      {/* Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              {initials}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{contact.name}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <PipelineBadge stage={contact.pipeline_stage} />
                    {contact.motivation_level && (
                      <Badge className={getMotivationColor(contact.motivation_level)}>
                        {contact.motivation_level} Motivation
                      </Badge>
                    )}
                    {contact.seven_day_rule_flag && (
                      <Badge variant="destructive">7-Day Rule</Badge>
                    )}
                  </div>
                </div>
                <Button asChild>
                  <Link href={`/contacts/${contact.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
              </div>

              {/* Contact Details */}
              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-2 text-slate-600 hover:text-blue-600"
                  >
                    <Phone className="h-4 w-4" />
                    {contact.phone}
                  </a>
                )}
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-2 text-slate-600 hover:text-blue-600"
                  >
                    <Mail className="h-4 w-4" />
                    {contact.email}
                  </a>
                )}
                {contact.address && (
                  <span className="flex items-center gap-2 text-slate-600">
                    <MapPin className="h-4 w-4" />
                    {contact.address}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Priority Score</p>
                <p className="text-xl font-bold">{contact.priority_score}/100</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Days Since Contact</p>
                <p className="text-xl font-bold">{contact.days_since_contact}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Last Contact</p>
                <p className="text-sm font-medium">{formatDate(contact.last_interaction_date)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Last Touch</p>
                <p className="text-sm font-medium">{contact.last_touch_type || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stage Progress */}
      <StageProgress contactId={contact.id} currentStage={contact.pipeline_stage} />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Behavioral Intelligence */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Behavioral Intelligence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-600">Timeframe</span>
              <span className="font-medium">{contact.timeframe || 'Not set'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-600">Lead Source</span>
              <span className="font-medium">{contact.lead_source || 'Not set'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-600">Pre-Approval</span>
              <span className="font-medium flex items-center gap-1">
                {contact.preapproval_status ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Approved
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-slate-400" />
                    Not yet
                  </>
                )}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-600">Consistency Score</span>
              <span className="font-medium">{contact.consistency_score}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Property Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Property Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-600 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Budget
              </span>
              <span className="font-medium">{contact.budget_range || 'Not set'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-600 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </span>
              <span className="font-medium">
                {contact.property_preferences?.location || 'Not set'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-600 flex items-center gap-2">
                <Home className="h-4 w-4" />
                Type
              </span>
              <span className="font-medium">
                {contact.property_preferences?.propertyType || 'Not set'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-600">Beds / Baths</span>
              <span className="font-medium">
                {contact.property_preferences?.beds || '–'} / {contact.property_preferences?.baths || '–'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {contact.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 whitespace-pre-wrap">{contact.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions & Activity Timeline - Client Component */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <ContactDetailClient contact={contact} />
        </CardContent>
      </Card>

      {/* Metadata */}
      <div className="text-sm text-slate-500 flex flex-wrap gap-4">
        <span>Created: {formatDate(contact.created_at)}</span>
        <span>Updated: {formatDate(contact.updated_at)}</span>
        <span>ID: {contact.id}</span>
      </div>
    </div>
  );
}
