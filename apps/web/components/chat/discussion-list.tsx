'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@marketplace/ui/components/avatar';
import { Badge } from '@marketplace/ui/components/badge';
import { Card } from '@marketplace/ui/components/card';
import { Input } from '@marketplace/ui/components/input';
import { ScrollArea } from '@marketplace/ui/components/scroll-area';
import { Search } from 'lucide-react';
import { cn } from '@marketplace/ui/lib/utils';

interface Discussion {
  id: number;
  hasUnread: boolean;
  deal: {
    id: number;
    title?: string | null;
  };
  buyer: {
    id: string;
    name?: string | null;
    image?: string | null;
  };
  seller: {
    id: string;
    name?: string | null;
    image?: string | null;
  };
  createdAt: Date | string;
}

interface DiscussionListProps {
  discussions: Discussion[];
  selectedId: number | null;
  currentUserId: string;
  searchQuery?: string;
  onSearch?: (query: string) => void;
}

export function DiscussionList({
  discussions,
  selectedId,
  currentUserId,
  searchQuery = '',
  onSearch,
}: DiscussionListProps) {
  // Filter discussions based on search query
  const filteredDiscussions = searchQuery
    ? discussions.filter((d) => {
        const contact = d.buyer.id === currentUserId ? d.seller : d.buyer;
        const searchLower = searchQuery.toLowerCase();
        return (
          contact.name?.toLowerCase().includes(searchLower) ||
          d.deal.title?.toLowerCase().includes(searchLower)
        );
      })
    : discussions;

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      {onSearch && (
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      )}

      {/* Discussion list */}
      <ScrollArea className="flex-1">
        {filteredDiscussions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {searchQuery ? 'No discussions found' : 'No discussions yet'}
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {filteredDiscussions.map((discussion) => {
              const contact =
                discussion.buyer.id === currentUserId
                  ? discussion.seller
                  : discussion.buyer;

              const isSelected = discussion.id === selectedId;

              return (
                <Link key={discussion.id} href={`/chat/${discussion.id}`}>
                  <Card
                    className={cn(
                      'p-4 hover:bg-accent transition-colors cursor-pointer',
                      isSelected && 'bg-accent border-primary'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarImage
                          src={contact.image ?? undefined}
                          alt={contact.name ?? undefined}
                        />
                        <AvatarFallback>
                          {contact.name?.charAt(0)?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold truncate">
                            {contact.name || 'Unknown User'}
                          </h3>
                          {discussion.hasUnread && (
                            <Badge variant="default" className="shrink-0">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          Deal: {discussion.deal.title || 'Untitled'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(discussion.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
