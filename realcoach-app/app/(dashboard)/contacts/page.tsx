'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContactCard } from '@/components/contacts/contact-card';
import { PipelineBadge } from '@/components/contacts/pipeline-badge';
import { CSVImportDialog } from '@/components/imports/csv-import-dialog';
import { GoogleContactsButton } from '@/components/imports/google-contacts-button';
import {
  Search,
  Plus,
  Users,
  Loader2,
  ArrowUpDown,
  LayoutGrid,
  List,
  Filter,
  FileSpreadsheet,
  Mail,
} from 'lucide-react';
import type { Contact, PipelineStage } from '@/lib/database.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

type ViewMode = 'grid' | 'list';
type SortOption = 'priority_score' | 'name' | 'last_interaction_date' | 'created_at';

const pipelineStages: (PipelineStage | 'all')[] = [
  'all',
  'Lead',
  'New Opportunity',
  'Active Opportunity',
  'Under Contract',
  'Closed',
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'priority_score', label: 'Priority Score' },
  { value: 'name', label: 'Name' },
  { value: 'last_interaction_date', label: 'Last Contact' },
  { value: 'created_at', label: 'Date Added' },
];

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<PipelineStage | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('priority_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [total, setTotal] = useState(0);

  // Import dialogs state
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [googleImportOpen, setGoogleImportOpen] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (stageFilter !== 'all') params.set('stage', stageFilter);
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);

      const response = await fetch(`/api/contacts?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch contacts');

      const data = await response.json();
      setContacts(data.contacts);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  }, [search, stageFilter, sortBy, sortOrder]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchContacts();
    }, 300);

    return () => clearTimeout(debounce);
  }, [fetchContacts]);

  const handleDelete = async () => {
    if (!contactToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/contacts/${contactToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete contact');

      toast.success('Contact deleted successfully');
      setDeleteDialogOpen(false);
      fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact');
    } finally {
      setIsDeleting(false);
      setContactToDelete(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setContactToDelete(id);
    setDeleteDialogOpen(true);
  };

  const stageCounts = contacts.reduce(
    (acc, contact) => {
      acc[contact.pipeline_stage] = (acc[contact.pipeline_stage] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
          <p className="text-slate-500">
            Manage your {total} contact{total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCsvImportOpen(true)}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button variant="outline" onClick={() => setGoogleImportOpen(true)}>
            <Mail className="h-4 w-4 mr-2" />
            Google Contacts
          </Button>
          <Button asChild>
            <Link href="/contacts/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Link>
          </Button>
        </div>
      </div>

      {/* Pipeline Stage Tabs */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={stageFilter} onValueChange={(v) => setStageFilter(v as PipelineStage | 'all')}>
            <TabsList className="w-full justify-start overflow-x-auto">
              {pipelineStages.map((stage) => (
                <TabsTrigger key={stage} value={stage} className="flex items-center gap-2">
                  {stage === 'all' ? (
                    <>
                      <Users className="h-4 w-4" />
                      All
                    </>
                  ) : (
                    <>
                      <PipelineBadge stage={stage} size="sm" />
                    </>
                  )}
                  <span className="ml-1 text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                    {stage === 'all' ? total : stageCounts[stage] || 0}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 min-h-[44px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search contacts by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 sm:w-auto w-full">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-full sm:w-[180px] h-11 min-h-[44px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
          >
            <ArrowUpDown className={`h-4 w-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
          </Button>

          {/* View Toggle */}
          <div className="hidden sm:flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Contact List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : contacts.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="font-medium text-slate-900 mb-1">
                {search || stageFilter !== 'all' ? 'No contacts found' : 'No contacts yet'}
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                {search || stageFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Add your first contact to get started'}
              </p>
              {!search && stageFilter === 'all' && (
                <Button asChild>
                  <Link href="/contacts/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onDelete={openDeleteDialog}
              variant="compact"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onDelete={openDeleteDialog}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this contact? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialogs */}
      <CSVImportDialog open={csvImportOpen} onOpenChange={setCsvImportOpen} />
      <GoogleContactsButton open={googleImportOpen} onOpenChange={setGoogleImportOpen} />

      {/* Mobile FAB for adding contacts */}
      <Button
        asChild
        className="lg:hidden fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-40"
        size="icon"
      >
        <Link href="/contacts/new">
          <Plus className="h-6 w-6" />
        </Link>
      </Button>
    </div>
  );
}
