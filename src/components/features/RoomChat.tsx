import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Send } from 'lucide-react';
import { chatApi } from '@lib/api/chat.api';
import { useAuthStore } from '@stores/auth.store';
import { cn } from '@lib/utils';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Input } from '@components/ui/input';

export default function RoomChat({ roomId }: { roomId: string }) {
  const [content, setContent] = useState('');
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    data: messages = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['room-messages', roomId],
    queryFn: () => chatApi.getRoomMessages(roomId),
    refetchInterval: (query) => (query.state.status === 'error' ? false : 3000),
  });

  const sendMessage = useMutation({
    mutationFn: (message: string) => chatApi.sendRoomMessage(roomId, message),
    onSuccess: async () => {
      setContent('');
      await queryClient.invalidateQueries({ queryKey: ['room-messages', roomId] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const message = content.trim();
    if (message) {
      sendMessage.mutate(message);
    }
  };

  return (
    <Card className="flex min-h-80 flex-col rounded-2xl">
      <CardHeader className="flex-row items-center gap-2 space-y-0 border-b px-4 py-4">
        <MessageCircle className="size-4 text-muted-foreground" />
        <CardTitle className="text-base">Room chat</CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col p-0">
        <div
          role="log"
          aria-live="polite"
          aria-label="Room messages"
          className="flex max-h-96 min-h-48 flex-1 flex-col gap-3 overflow-y-auto p-4"
        >
          {isLoading ? (
            <p className="m-auto text-sm text-muted-foreground">Loading messages...</p>
          ) : isError ? (
            <div className="m-auto flex flex-col items-center gap-2 text-center">
              <p role="alert" className="text-sm text-destructive">
                Could not load chat messages.
              </p>
              <Button type="button" variant="ghost" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : messages.length ? (
            messages.map((message) => {
              const isOwnMessage = message.senderId === userId;
              const senderName =
                message.sender.profile?.displayName || message.sender.email;

              return (
                <div
                  key={message.id}
                  className={cn('flex flex-col gap-1', isOwnMessage ? 'items-end' : 'items-start')}
                >
                  <div
                    className={cn(
                      'max-w-full rounded-2xl px-3 py-2',
                      isOwnMessage
                        ? 'rounded-br-md bg-primary text-primary-foreground'
                        : 'rounded-bl-md bg-muted text-foreground',
                    )}
                  >
                    {!isOwnMessage && (
                      <p className="mb-1 truncate text-xs font-semibold">{senderName}</p>
                    )}
                    <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
                  </div>
                  <time className="px-1 text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat(undefined, {
                      hour: 'numeric',
                      minute: '2-digit',
                    }).format(new Date(message.createdAt))}
                  </time>
                </div>
              );
            })
          ) : (
            <p className="m-auto text-center text-sm text-muted-foreground">
              No messages yet. Start the conversation.
            </p>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t p-3">
          <Input
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write a message..."
            aria-label="Write a message"
            maxLength={2000}
            autoComplete="off"
            disabled={sendMessage.isPending}
          />
          <Button
            type="submit"
            size="icon"
            className="shrink-0 rounded-xl"
            aria-label="Send message"
            disabled={!content.trim() || sendMessage.isPending}
          >
            <Send className="size-4" />
          </Button>
        </form>
        {sendMessage.isError && (
          <p role="alert" className="px-4 pb-3 text-xs text-destructive">
            Could not send message. Please try again.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
