'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Phone, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Contact {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  nextAction?: {
    type: string;
    script: string;
  };
}

interface ActionButtonsProps {
  contact: Contact;
  onCompleted?: () => void;
}

export function ActionButtons({ contact, onCompleted }: ActionButtonsProps) {
  const [completing, setCompleting] = useState(false);

  const handleCompleteAction = async (actionType: string) => {
    setCompleting(true);

    try {
      const response = await fetch(`/api/contacts/${contact.id}/complete-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actionType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete action');
      }

      const data = await response.json();

      toast.success(`Action completed for ${contact.name}!`, {
        description: `${actionType} logged successfully`,
      });

      if (onCompleted) {
        onCompleted();
      }

      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error completing action:', error);
      toast.error('Failed to complete action', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setCompleting(false);
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'Call':
        return <Phone className="h-4 w-4" />;
      case 'Text':
      case 'Email':
        return <Mail className="h-4 w-4" />;
      default:
        return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  const actionType = contact.nextAction?.type || 'Call';

  // Use default (larger) size on mobile for 44px touch targets, sm on desktop
  return (
    <div className="flex items-center gap-2">
      {contact.phone && (
        <Button
          variant="outline"
          size="default"
          className="h-11 min-h-[44px] lg:h-9 lg:min-h-0 px-3 lg:px-2"
          asChild
          disabled={completing}
        >
          <a href={`tel:${contact.phone}`}>
            <Phone className="h-4 w-4" />
          </a>
        </Button>
      )}

      {contact.email && (
        <Button
          variant="outline"
          size="default"
          className="h-11 min-h-[44px] lg:h-9 lg:min-h-0 px-3 lg:px-2"
          asChild
          disabled={completing}
        >
          <a href={`mailto:${contact.email}`}>
            <Mail className="h-4 w-4" />
          </a>
        </Button>
      )}

      <Button
        size="default"
        className="h-11 min-h-[44px] lg:h-9 lg:min-h-0 px-4 lg:px-3"
        onClick={() => handleCompleteAction(actionType)}
        disabled={completing}
      >
        {completing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4 mr-1" />
            <span className="hidden lg:inline">Complete</span>
          </>
        )}
      </Button>
    </div>
  );
}
