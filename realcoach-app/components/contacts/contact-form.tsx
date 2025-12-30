'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, X } from 'lucide-react';
import type {
  Contact,
  PipelineStage,
  MotivationLevel,
  Timeframe,
  LeadSource,
} from '@/lib/database.types';
import { toast } from 'sonner';

interface ContactFormProps {
  contact?: Contact;
  mode: 'create' | 'edit';
}

const pipelineStages: PipelineStage[] = [
  'Lead',
  'New Opportunity',
  'Active Opportunity',
  'Under Contract',
  'Closed',
];

const motivationLevels: MotivationLevel[] = ['High', 'Medium', 'Low'];

const timeframes: Timeframe[] = ['Immediate', '1-3 months', '3-6 months', '6+ months'];

const leadSources: LeadSource[] = [
  'Referral',
  'Zillow',
  'Website',
  'Cold Call',
  'Open House',
  'Social Media',
  'Other',
];

export function ContactForm({ contact, mode }: ContactFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: contact?.name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    address: contact?.address || '',
    pipeline_stage: contact?.pipeline_stage || 'Lead',
    lead_source: contact?.lead_source || '',
    motivation_level: contact?.motivation_level || '',
    timeframe: contact?.timeframe || '',
    budget_range: contact?.budget_range || '',
    preapproval_status: contact?.preapproval_status || false,
    notes: contact?.notes || '',
    // Property preferences
    property_location: contact?.property_preferences?.location || '',
    property_price_range: contact?.property_preferences?.priceRange || '',
    property_type: contact?.property_preferences?.propertyType || '',
    property_beds: contact?.property_preferences?.beds?.toString() || '',
    property_baths: contact?.property_preferences?.baths?.toString() || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare property preferences
      const propertyPreferences = {
        location: formData.property_location || undefined,
        priceRange: formData.property_price_range || undefined,
        propertyType: formData.property_type || undefined,
        beds: formData.property_beds ? parseInt(formData.property_beds) : undefined,
        baths: formData.property_baths ? parseInt(formData.property_baths) : undefined,
      };

      const payload = {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        pipeline_stage: formData.pipeline_stage,
        lead_source: formData.lead_source || null,
        motivation_level: formData.motivation_level || null,
        timeframe: formData.timeframe || null,
        budget_range: formData.budget_range || null,
        preapproval_status: formData.preapproval_status,
        property_preferences: propertyPreferences,
        notes: formData.notes || null,
      };

      const url = mode === 'create' ? '/api/contacts' : `/api/contacts/${contact?.id}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save contact');
      }

      const savedContact = await response.json();

      toast.success(mode === 'create' ? 'Contact created successfully' : 'Contact updated successfully');
      router.push(`/contacts/${savedContact.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error saving contact:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save contact');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="123 Main St, City, State"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline & Status */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline & Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pipeline_stage">Pipeline Stage</Label>
              <Select
                value={formData.pipeline_stage}
                onValueChange={(value) => handleChange('pipeline_stage', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {pipelineStages.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead_source">Lead Source</Label>
              <Select
                value={formData.lead_source}
                onValueChange={(value) => handleChange('lead_source', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {leadSources.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="motivation_level">Motivation Level</Label>
              <Select
                value={formData.motivation_level}
                onValueChange={(value) => handleChange('motivation_level', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {motivationLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeframe">Timeframe</Label>
              <Select
                value={formData.timeframe}
                onValueChange={(value) => handleChange('timeframe', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  {timeframes.map((tf) => (
                    <SelectItem key={tf} value={tf}>
                      {tf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Property Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="property_location">Preferred Location</Label>
              <Input
                id="property_location"
                value={formData.property_location}
                onChange={(e) => handleChange('property_location', e.target.value)}
                placeholder="e.g., Downtown, Suburbs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget_range">Budget Range</Label>
              <Input
                id="budget_range"
                value={formData.budget_range}
                onChange={(e) => handleChange('budget_range', e.target.value)}
                placeholder="e.g., $300,000 - $500,000"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="property_type">Property Type</Label>
              <Input
                id="property_type"
                value={formData.property_type}
                onChange={(e) => handleChange('property_type', e.target.value)}
                placeholder="e.g., Single Family, Condo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="property_beds">Bedrooms</Label>
              <Input
                id="property_beds"
                type="number"
                min="0"
                value={formData.property_beds}
                onChange={(e) => handleChange('property_beds', e.target.value)}
                placeholder="e.g., 3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="property_baths">Bathrooms</Label>
              <Input
                id="property_baths"
                type="number"
                min="0"
                step="0.5"
                value={formData.property_baths}
                onChange={(e) => handleChange('property_baths', e.target.value)}
                placeholder="e.g., 2"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="preapproval_status"
              checked={formData.preapproval_status}
              onChange={(e) => handleChange('preapproval_status', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            <Label htmlFor="preapproval_status" className="text-sm font-normal">
              Has mortgage pre-approval
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Additional notes about this contact..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {mode === 'create' ? 'Create Contact' : 'Save Changes'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
