import { ContactForm } from '@/components/contacts/contact-form';

export default function NewContactPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Add New Contact</h1>
        <p className="text-slate-500">Create a new contact and start tracking their journey</p>
      </div>

      <ContactForm mode="create" />
    </div>
  );
}
