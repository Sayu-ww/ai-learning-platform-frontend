import { useEffect, useState } from 'react';
import { ArrowLeft, Link2, Plus, Users, Video } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { roomsApi } from '@lib/api/rooms.api';
import { useRoomSocket } from '@hooks/useSocket';
import { useRoomStore } from '@stores/room.store';
import { useAuthStore } from '@stores/auth.store';
import { socketService } from '@lib/socket/socket.service';
import type { RoomParticipantDetails } from '@app-types/room.types';
import VideoPlayer from '@components/features/VideoPlayer';
import RoomChat from '@components/features/RoomChat';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@components/ui/dialog';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';

interface CurrentVideo {
  id: string;
  source: 'youtube' | 'vimeo' | 'rutube';
  url: string;
}

function parseVideoUrl(value: string): CurrentVideo | null {
  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase();
    const segments = url.pathname.split('/').filter(Boolean);

    if (host === 'youtu.be') {
      const id = segments[0];
      return id ? { id, source: 'youtube', url: url.toString() } : null;
    }

    if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
      const id = url.searchParams.get('v') || segments[1];
      return id ? { id, source: 'youtube', url: url.toString() } : null;
    }

    if (host === 'vimeo.com' || host.endsWith('.vimeo.com')) {
      const id = segments[segments.length - 1];
      return id ? { id, source: 'vimeo', url: url.toString() } : null;
    }

    if (host === 'rutube.ru' || host.endsWith('.rutube.ru')) {
      const videoIndex = segments.indexOf('video');
      const id = videoIndex >= 0 ? segments[videoIndex + 1] : undefined;
      return id ? { id, source: 'rutube', url: url.toString() } : null;
    }

    return null;
  } catch {
    return null;
  }
}

function getDisplayName(participant: RoomParticipantDetails) {
  return participant.user.profile?.displayName || participant.user.email;
}

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const user = useAuthStore((state) => state.user);
  const { setCurrentRoom, participants, setParticipants, removeParticipant } = useRoomStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoError, setVideoError] = useState<string | null>(null);
  const [currentVideo, setCurrentVideo] = useState<CurrentVideo | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const queryClient = useQueryClient();

  const { data: room, isLoading } = useQuery({
    queryKey: ['room', roomId],
    queryFn: () => roomsApi.getRoom(roomId!),
    enabled: !!roomId,
  });

  const {
    data: participantsData,
    isLoading: participantsLoading,
    isError: participantsError,
  } = useQuery({
    queryKey: ['room-participants', roomId],
    queryFn: () => roomsApi.getParticipants(roomId!),
    enabled: !!roomId,
    refetchInterval: 5000, // Обновляем список участников каждые 5 секунд
  });

  const { data: savedVideo } = useQuery({
    queryKey: ['room-video', roomId],
    queryFn: () => roomsApi.getCurrentVideo(roomId!),
    enabled: !!roomId,
  });

  const joinRoomMutation = useMutation({
    mutationFn: (roomId: string) => roomsApi.joinRoom(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-participants', roomId] });
      queryClient.invalidateQueries({ queryKey: ['my-rooms'] });
    },
  });

  const setVideoMutation = useMutation({
    mutationFn: ({ roomId, videoUrl }: { roomId: string; videoUrl: string }) =>
      roomsApi.setCurrentVideo(roomId, videoUrl),
    onSuccess: (savedVideo, variables) => {
      console.log('Video saved successfully:', savedVideo);
      queryClient.invalidateQueries({ queryKey: ['room-video', roomId] });

      // Use the response from server which includes the parsed videoId
      if (savedVideo && savedVideo.currentVideoUrl && savedVideo.currentVideoId) {
        const parsedVideo = parseVideoUrl(savedVideo.currentVideoUrl);
        if (parsedVideo) {
          setCurrentVideo({
            ...parsedVideo,
            id: savedVideo.currentVideoId, // Use videoId from server
          });
        }
      } else {
        // Fallback to parsing the input URL
        const parsedVideo = parseVideoUrl(variables.videoUrl);
        if (parsedVideo) {
          setCurrentVideo(parsedVideo);
        }
      }

      setDialogOpen(false);
      setVideoUrl('');
      setVideoError(null);
    },
  });

  const isRoomParticipant =
    participantsData?.some((participant) => participant.userId === user?.id) ?? false;

  // Подключаемся к сокету комнаты только если пользователь участник
  // и данные участников загружены
  const { isConnected: isSocketConnected } = useRoomSocket(isRoomParticipant && !participantsLoading ? roomId : undefined);

  // Управление состоянием подключения
  useEffect(() => {
    if (isRoomParticipant && isSocketConnected) {
      setIsConnecting(false);
    } else if (isRoomParticipant && !participantsLoading) {
      // Даем 2 секунды на подключение, затем убираем индикатор
      const timer = setTimeout(() => setIsConnecting(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isRoomParticipant, isSocketConnected, participantsLoading]);

  useEffect(() => {
    if (roomId) {
      setCurrentRoom(roomId);
    }
    return () => setCurrentRoom(null);
  }, [roomId, setCurrentRoom]);

  useEffect(() => {
    if (participantsData) {
      setParticipants(participantsData);
    }
  }, [participantsData, setParticipants]);

  useEffect(() => {
    if (savedVideo && savedVideo.url) {
      const parsedVideo = parseVideoUrl(savedVideo.url);
      if (parsedVideo && savedVideo.videoId) {
        setCurrentVideo({
          ...parsedVideo,
          id: savedVideo.videoId,
        });
      }
    }
  }, [savedVideo]);

  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    // Handle user leaving the room
    socket.on('room:user-left', ({ userId }: { userId: string }) => {
      removeParticipant(userId);
    });

    // Handle video change from other users
    socket.on('room:video-changed', (data: { videoUrl: string; videoId: string; videoSource: string }) => {
      console.log('Video changed by another user:', data);
      const parsedVideo = parseVideoUrl(data.videoUrl);
      if (parsedVideo && data.videoId) {
        setCurrentVideo({
          ...parsedVideo,
          id: data.videoId,
        });
      }
    });

    return () => {
      socket.off('room:user-left');
      socket.off('room:video-changed');
    };
  }, [removeParticipant]);

  const userRole =
    participants.find((participant) => participant.userId === user?.id)?.role ?? 'participant';
  const isAdmin = ['owner', 'admin', 'moderator'].includes(userRole);

  const handleAddVideo = (event: React.FormEvent) => {
    event.preventDefault();

    if (!roomId) return;

    const parsedVideo = parseVideoUrl(videoUrl);
    if (!parsedVideo) {
      setVideoError('Enter a valid YouTube, Vimeo, or Rutube video link.');
      return;
    }

    setVideoError(null);
    setVideoMutation.mutate({ roomId, videoUrl: parsedVideo.url });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">Loading study room...</CardContent>
      </Card>
    );
  }

  if (!room || !roomId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-start gap-4 p-6">
          <div>
            <h1 className="text-xl font-semibold">Room not found</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              This room may have been removed or the link may be incorrect.
            </p>
          </div>
          <Button variant="outline" className="rounded-xl" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 size-4" />
            Go back
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (participantsLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Checking room membership...
        </CardContent>
      </Card>
    );
  }

  if (participantsError || !participantsData) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">
          Could not load room membership. Please refresh and try again.
        </CardContent>
      </Card>
    );
  }

  if (!isRoomParticipant) {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <Link
          to="/rooms"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          All rooms
        </Link>
        <Card className="rounded-2xl">
          <CardContent className="flex flex-col items-start gap-4 p-6 sm:p-8">
            <div>
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium capitalize text-accent-foreground">
                {room.type} room
              </span>
              <h1 className="mt-4 text-2xl font-semibold">{room.name}</h1>
              {room.description && (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {room.description}
                </p>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {room.type === 'public'
                ? 'Join this room to watch videos and take part in the chat.'
                : 'This room is private. Ask a room member for an invitation to join.'}
            </p>
            {joinRoomMutation.isError && (
              <p role="alert" className="text-sm text-destructive">
                Could not join this room. It may have become private or unavailable.
              </p>
            )}
            {room.type === 'public' && (
              <Button
                type="button"
                disabled={joinRoomMutation.isPending}
                onClick={() => joinRoomMutation.mutate(roomId)}
                className="rounded-xl"
              >
                {joinRoomMutation.isPending ? 'Joining...' : 'Join room'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            All rooms
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="max-w-full truncate text-2xl font-semibold tracking-tight sm:text-3xl">
              {room.name}
            </h1>
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              {userRole}
            </span>
            {isConnecting && (
              <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                <span className="inline-block size-2 animate-pulse rounded-full bg-current" />
                Connecting...
              </span>
            )}
            {!isConnecting && isSocketConnected && (
              <span className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-600 dark:text-green-400">
                <span className="inline-block size-2 rounded-full bg-current" />
                Connected
              </span>
            )}
          </div>
          {room.description && (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {room.description}
            </p>
          )}
        </div>
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="size-4" />
          {participants.length} {participants.length === 1 ? 'participant' : 'participants'}
        </span>
      </header>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="min-w-0 space-y-4 xl:col-span-2">
          {currentVideo ? (
            <Card className="overflow-hidden rounded-2xl">
              <CardContent className="p-3 sm:p-5">
                <VideoPlayer
                  roomId={roomId}
                  videoId={currentVideo.id}
                  source={currentVideo.source}
                  isAdmin={isAdmin}
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="flex min-h-72 items-center justify-center rounded-2xl sm:min-h-96">
              <CardContent className="flex max-w-md flex-col items-center px-6 py-10 text-center">
                <span className="grid size-14 place-items-center rounded-2xl bg-accent text-accent-foreground">
                  <Video className="size-6" />
                </span>
                <h2 className="mt-5 text-lg font-semibold">Bring a video to the room</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Add a YouTube video and start learning with everyone here.
                </p>
                {isAdmin ? (
                  <Button onClick={() => setDialogOpen(true)} className="mt-5 rounded-xl">
                    <Plus className="mr-2 size-4" />
                    Add a video
                  </Button>
                ) : (
                  <p className="mt-5 text-sm text-muted-foreground">
                    A room moderator can add a shared video.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
          {currentVideo && isAdmin && (
            <Button
              variant="outline"
              onClick={() => {
                console.log('Change video button clicked, opening dialog');
                setDialogOpen(true);
              }}
              className="rounded-xl"
            >
              <Link2 className="mr-2 size-4" />
              Change video
            </Button>
          )}
        </section>

        <aside className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <Card className="rounded-2xl">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base">People in this room</CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-2">
              {participants.length ? (
                participants.map((participant) => {
                  const name = getDisplayName(participant);
                  return (
                    <div
                      key={participant.id}
                      className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/70"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                        {name.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{name}</span>
                        <span className="block text-xs capitalize text-muted-foreground">
                          {participant.role}
                        </span>
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="py-3 text-sm text-muted-foreground">No participants yet.</p>
              )}
            </CardContent>
          </Card>

          <RoomChat roomId={roomId} />
        </aside>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogTitle className="text-xl font-semibold">Add a video</DialogTitle>
          <DialogDescription>
            Paste a YouTube, Vimeo, or Rutube link to share it with your study group.
          </DialogDescription>
          <form onSubmit={handleAddVideo} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="video-url">Video link</Label>
              <Input
                id="video-url"
                type="url"
                required
                value={videoUrl}
                onChange={(event) => {
                  setVideoUrl(event.target.value);
                  setVideoError(null);
                  setVideoMutation.reset();
                }}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            {(videoError || setVideoMutation.isError) && (
              <p role="alert" className="text-sm text-destructive">
                {videoError ||
                  'Could not save the video. If this keeps happening, restart the backend to load the room video endpoint.'}
              </p>
            )}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  setVideoError(null);
                }}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!videoUrl || setVideoMutation.isPending}
                className="rounded-xl"
              >
                {setVideoMutation.isPending ? 'Saving...' : 'Add video'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
