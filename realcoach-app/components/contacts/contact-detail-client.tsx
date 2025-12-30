'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, CheckCircle2, Phone, Mail } from 'lucide-react';
import { ActivityTimeline } from './activity-timeline';
import { LogConversationDialog } from './log-conversation-dialog';
import type { Contact } from '@/lib/database.types';

interface ContactDetailClientProps {
  contact: Contact;
}

export function ContactDetailClient({ contact }: ContactDetailClientProps) {
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [timelineKey, setTimelineKey] = useState(0);

  const handleLogSuccess = () => {
    // Refresh the timeline by changing its key
    setTimelineKey((prev) => prev + 1);
  };

  return (
    <>
      {/* Quick Actions Card */}
      <div className="flex flex-wrap gap-3">
        {contact.phone && (
          <Button variant="outline" asChild>
            <a href={`tel:${contact.phone}`}>
              <Phone className="h-4 w-4 mr-2" />
              Call
            </a>
          </Button>
        )}
        {contact.email && (
          <Button variant="outline" asChild>
            <a href={`mailto:${contact.email}`}>
              <Mail className="h-4 w-4 mr-2" />
              Email
            </a>
          </Button>
        )}
        <Button variant="outline" onClick={() => setLogDialogOpen(true)}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Log Conversation
        </Button>
        <Button variant="outline">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Record Interaction
        </Button>
      </div>

      {/* Activity Timeline */}
      <ActivityTimeline
        key={timelineKey}
        contactId={contact.id}
        onLogClick={() => setLogDialogOpen(true)}
      />

      {/* Log Conversation Dialog */}
      <LogConversationDialog
        contactId={contact.id}
        contactName={contact.name}
        open={logDialogOpen}
        onOpenChange={setLogDialogOpen}
        onSuccess={handleLogSuccess}
      />
    </>
  );
}
