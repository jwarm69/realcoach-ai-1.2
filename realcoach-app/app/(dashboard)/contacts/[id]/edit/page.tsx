import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ContactForm } from '@/components/contacts/contact-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { Contact } from '@/lib/database.types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditContactPage({ params }: PageProps) {
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

  return (
    <div className="max-w-3xl mx-auto">
      <Button variant="ghost" asChild className="mb-4">
        <Link href={`/contacts/${contact.id}`}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contact
        </Link>
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Edit Contact</h1>
        <p className="text-slate-500">Update information for {contact.name}</p>
      </div>

      <ContactForm contact={contact} mode="edit" />
    </div>
  );
}
