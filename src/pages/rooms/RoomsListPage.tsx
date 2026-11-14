import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, DoorOpen, Plus, Trash2, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { roomsApi } from '@lib/api/rooms.api';
import type { MyRoom } from '@app-types/room.types';
import { Button } from '@components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@components/ui/dialog';
import { Card, CardContent } from '@components/ui/card';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { cn } from '@lib/utils';

export default function RoomsListPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [roomType, setRoomType] = useState<'public' | 'private'>('private');
  const [deleteTarget, setDeleteTarget] = useState<MyRoom | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: myRooms, isLoading: loadingMy } = useQuery({
    queryKey: ['my-rooms'],
    queryFn: roomsApi.getMyRooms,
  });

  const { data: publicRooms, isLoading: loadingPublic } = useQuery({
    queryKey: ['public-rooms'],
    queryFn: () => roomsApi.getPublicRooms(20),
  });

  const createRoom = useMutation({
    mutationFn: roomsApi.create,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-rooms'] }),
        queryClient.invalidateQueries({ queryKey: ['public-rooms'] }),
      ]);
      setDialogOpen(false);
      setRoomName('');
      setRoomDescription('');
    },
  });

  const joinRoom = useMutation({
    mutationFn: roomsApi.joinRoom,
    onSuccess: async (_room, roomId) => {
      await queryClient.invalidateQueries({ queryKey: ['my-rooms'] });
      navigate(`/rooms/${roomId}`);
    },
  });

  const deleteRoom = useMutation({
    mutationFn: roomsApi.deleteRoom,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['my-rooms'] });
      await queryClient.invalidateQueries({ queryKey: ['public-rooms'] });
      setDeleteTarget(null);
    },
  });

  const handleCreateRoom = (event: React.FormEvent) => {
    event.preventDefault();
    createRoom.mutate({
      name: roomName.trim(),
      description: roomDescription.trim() || undefined,
      type: roomType,
      isPermanent: true,
    });
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Learn together</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Study rooms</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Join a group or create a space to learn with friends.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="min-h-11 rounded-xl">
          <Plus className="mr-2 size-4" />
          Create a room
        </Button>
      </section>

      <section aria-labelledby="my-rooms-heading" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 id="my-rooms-heading" className="text-lg font-semibold">
            Your rooms
          </h2>
          <span className="text-sm text-muted-foreground">{myRooms?.length ?? 0} rooms</span>
        </div>
        {loadingMy ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">Loading your rooms...</CardContent>
          </Card>
        ) : myRooms?.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {myRooms.map((room) => (
              <Card
                key={room.id}
                className="h-full rounded-2xl transition-colors hover:border-primary/40 hover:bg-accent/30"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      to={`/rooms/${room.id}`}
                      className="grid size-11 place-items-center rounded-xl bg-accent text-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={`Open ${room.name}`}
                    >
                      <DoorOpen className="size-5" />
                    </Link>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'rounded-full px-3 py-1 text-xs font-medium',
                          room.type === 'public'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {room.type}
                      </span>
                      {room.userRole === 'owner' && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${room.name}`}
                          title="Delete room"
                          onClick={() => setDeleteTarget(room)}
                          className="size-8 rounded-lg text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <Link
                    to={`/rooms/${room.id}`}
                    className="block rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <h3 className="mt-5 truncate font-semibold">{room.name}</h3>
                    <p className="mt-2 min-h-10 text-sm leading-5 text-muted-foreground">
                      {room.description || 'A shared space to learn and exchange ideas.'}
                    </p>
                  </Link>
                  <div className="mt-5 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="size-3.5" />
                      {room.userRole}
                    </span>
                    <Link
                      to={`/rooms/${room.id}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                    >
                      Open room
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl border-dashed">
            <CardContent className="flex flex-col items-center px-6 py-10 text-center">
              <span className="grid size-12 place-items-center rounded-2xl bg-accent text-accent-foreground">
                <DoorOpen className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold">Your first room is waiting</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                Create a private space for your group or start a public room for others to join.
              </p>
              <Button onClick={() => setDialogOpen(true)} variant="outline" className="mt-5 rounded-xl">
                <Plus className="mr-2 size-4" />
                Create a room
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      <section aria-labelledby="public-rooms-heading" className="space-y-4">
        <div>
          <h2 id="public-rooms-heading" className="text-lg font-semibold">
            Discover public rooms
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Open spaces where you can meet other learners.
          </p>
        </div>
        {loadingPublic ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Looking for public rooms...
            </CardContent>
          </Card>
        ) : publicRooms?.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {publicRooms.map((room) => {
              const isMember = myRooms?.some((myRoom) => myRoom.id === room.id) ?? false;
              const isJoining = joinRoom.isPending && joinRoom.variables === room.id;

              return (
                <Card
                  key={room.id}
                  className="h-full rounded-2xl transition-colors hover:border-primary/40 hover:bg-accent/30"
                >
                  <CardContent className="flex h-full flex-col p-5">
                    <span className="grid size-11 place-items-center rounded-xl bg-muted text-muted-foreground">
                      <Users className="size-5" />
                    </span>
                    <h3 className="mt-5 truncate font-semibold">{room.name}</h3>
                    <p className="mt-2 flex-1 text-sm leading-5 text-muted-foreground">
                      {room.description || 'Join this room and learn with the community.'}
                    </p>
                    <Button
                      type="button"
                      variant={isMember ? 'outline' : 'default'}
                      disabled={isJoining}
                      onClick={() =>
                        isMember ? navigate(`/rooms/${room.id}`) : joinRoom.mutate(room.id)
                      }
                      className="mt-5 w-full rounded-xl"
                    >
                      {isJoining ? 'Joining...' : isMember ? 'Open room' : 'Join room'}
                      <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="rounded-2xl">
            <CardContent className="p-6 text-sm text-muted-foreground">
              There are no public rooms yet. Create one and invite others to join.
            </CardContent>
          </Card>
        )}
        {joinRoom.isError && (
          <p role="alert" className="text-sm text-destructive">
            Could not join this room. It may have become private or unavailable.
          </p>
        )}
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <div className="space-y-2 pr-8">
            <DialogTitle className="text-xl font-semibold">Create a study room</DialogTitle>
            <DialogDescription>
              Give your group a name and choose whether everyone can find it.
            </DialogDescription>
          </div>
          <form onSubmit={handleCreateRoom} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="room-name">Room name</Label>
              <Input
                id="room-name"
                required
                maxLength={100}
                value={roomName}
                onChange={(event) => setRoomName(event.target.value)}
                placeholder="e.g. Product design study group"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room-description">Description</Label>
              <Input
                id="room-description"
                maxLength={500}
                value={roomDescription}
                onChange={(event) => setRoomDescription(event.target.value)}
                placeholder="What are you learning together?"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room-visibility">Visibility</Label>
              <select
                id="room-visibility"
                value={roomType}
                onChange={(event) => setRoomType(event.target.value as 'public' | 'private')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="private">Private — invite-only</option>
                <option value="public">Public — discoverable by everyone</option>
              </select>
            </div>
            {createRoom.isError && (
              <p role="alert" className="text-sm text-destructive">
                Could not create the room. Please try again.
              </p>
            )}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createRoom.isPending} className="rounded-xl">
                {createRoom.isPending ? 'Creating...' : 'Create room'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <div className="space-y-2 pr-8">
            <DialogTitle className="text-xl font-semibold">Delete this room?</DialogTitle>
            <DialogDescription>
              “{deleteTarget?.name}” and its room data will be permanently removed.
            </DialogDescription>
          </div>
          {deleteRoom.isError && (
            <p role="alert" className="text-sm text-destructive">
              Could not delete the room. Make sure you are its owner and try again.
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!deleteTarget || deleteRoom.isPending}
              onClick={() => deleteTarget && deleteRoom.mutate(deleteTarget.id)}
              className="rounded-xl"
            >
              {deleteRoom.isPending ? 'Deleting...' : 'Delete room'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
