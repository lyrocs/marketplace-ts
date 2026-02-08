'use client';

import { useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@marketplace/ui/components/avatar';
import { Button } from '@marketplace/ui/components/button';
import { ScrollArea } from '@marketplace/ui/components/scroll-area';
import { Loader2 } from 'lucide-react';
import { cn } from '@marketplace/ui/lib/utils';

export interface MatrixMessage {
  eventId: string;
  sender: string;
  body: string;
  timestamp: number;
}

interface ChatRoomProps {
  messages: MatrixMessage[];
  currentUserMatrixLogin: string;
  otherUserName?: string;
  otherUserImage?: string;
  isLoading: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

export function ChatRoom({
  messages,
  currentUserMatrixLogin,
  otherUserName,
  otherUserImage,
  isLoading,
  onLoadMore,
  hasMore,
}: ChatRoomProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (!isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-muted-foreground">No messages yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Start the conversation!
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div ref={scrollRef} className="p-4 space-y-4">
        {/* Load more button */}
        {hasMore && onLoadMore && (
          <div className="text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                'Load more messages'
              )}
            </Button>
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => {
          const isOwn = message.sender === currentUserMatrixLogin;

          return (
            <div
              key={message.eventId}
              className={cn(
                'flex gap-3',
                isOwn ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              {/* Avatar (only for other user) */}
              {!isOwn && (
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={otherUserImage || undefined} />
                  <AvatarFallback>
                    {otherUserName?.charAt(0)?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
              )}

              {/* Message bubble */}
              <div
                className={cn(
                  'max-w-[70%] rounded-lg px-4 py-2',
                  isOwn
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.body}
                </p>
                <p
                  className={cn(
                    'text-xs mt-1',
                    isOwn
                      ? 'text-primary-foreground/70'
                      : 'text-muted-foreground'
                  )}
                >
                  {formatTimestamp(message.timestamp)}
                </p>
              </div>
            </div>
          );
        })}

        {/* Auto-scroll anchor */}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
