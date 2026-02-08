'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@marketplace/ui/components/avatar';
import { Badge } from '@marketplace/ui/components/badge';
import { Button } from '@marketplace/ui/components/button';
import { ArrowLeft } from 'lucide-react';

type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

interface ChatHeaderProps {
  discussion: {
    deal: {
      id: number;
      title?: string;
    };
    buyer: {
      id: string;
      name?: string;
      image?: string;
    };
    seller: {
      id: string;
      name?: string;
      image?: string;
    };
  };
  connectionStatus: ConnectionStatus;
  currentUserId: string;
}

const statusConfig: Record<ConnectionStatus, { label: string; variant: any }> = {
  connected: { label: 'Connected', variant: 'default' },
  connecting: { label: 'Connecting...', variant: 'secondary' },
  disconnected: { label: 'Disconnected', variant: 'destructive' },
  error: { label: 'Error', variant: 'destructive' },
};

export function ChatHeader({
  discussion,
  connectionStatus,
  currentUserId,
}: ChatHeaderProps) {
  // Determine the other party (contact)
  const contact =
    discussion.buyer.id === currentUserId
      ? discussion.seller
      : discussion.buyer;

  const { label, variant } = statusConfig[connectionStatus];

  return (
    <div className="border-b bg-background">
      <div className="flex items-center gap-3 p-4">
        {/* Back button for mobile */}
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="md:hidden"
        >
          <Link href="/chat">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to discussions</span>
          </Link>
        </Button>

        {/* Contact info */}
        <Avatar className="h-10 w-10">
          <AvatarImage src={contact.image || undefined} alt={contact.name} />
          <AvatarFallback>
            {contact.name?.charAt(0)?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold truncate">{contact.name || 'Unknown User'}</h2>
          <Link
            href={`/deal/${discussion.deal.id}`}
            className="text-sm text-muted-foreground hover:underline truncate block"
          >
            Deal: {discussion.deal.title || 'Untitled'}
          </Link>
        </div>

        {/* Connection status */}
        <Badge variant={variant} className="shrink-0">
          {label}
        </Badge>
      </div>
    </div>
  );
}
