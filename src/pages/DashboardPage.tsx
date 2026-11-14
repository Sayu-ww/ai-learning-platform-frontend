import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BookOpen, DoorOpen, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { authApi } from '@lib/api/auth.api';
import { roomsApi } from '@lib/api/rooms.api';
import { Card, CardContent } from '@components/ui/card';

const shortcuts = [
  {
    to: '/rooms',
    title: 'Study rooms',
    description: 'Meet your learning group and study together.',
    icon: DoorOpen,
    action: 'Explore rooms',
  },
  {
    to: '/courses',
    title: 'Courses',
    description: 'Find a topic you would like to explore next.',
    icon: BookOpen,
    action: 'Browse courses',
  },
  {
    to: '/profile',
    title: 'Your profile',
    description: 'Keep your personal details up to date.',
    icon: UserRound,
    action: 'View profile',
  },
];

export default function DashboardPage() {
  const { data: account, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getCurrentUser,
  });

  const { data: rooms } = useQuery({
    queryKey: ['my-rooms'],
    queryFn: roomsApi.getMyRooms,
  });

  const displayName =
    account?.profile?.displayName || account?.user?.email?.split('@')[0] || 'there';

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="overflow-hidden rounded-3xl bg-primary px-6 py-8 text-primary-foreground shadow-lg shadow-primary/10 sm:px-10 sm:py-10">
        <p className="text-sm font-medium text-primary-foreground/75">Your learning space</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          {isLoading ? 'Welcome back' : `Welcome back, ${displayName}`}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-primary-foreground/75 sm:text-base">
          Make progress at your own pace, or bring your ideas to a room and learn together.
        </p>
        <Link
          to="/rooms"
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary-foreground px-4 py-2 text-sm font-semibold text-primary transition-opacity hover:opacity-90"
        >
          Find a study room
          <ArrowRight className="size-4" />
        </Link>
      </section>

      <section aria-labelledby="overview-heading">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">Your overview</p>
            <h2 id="overview-heading" className="mt-1 text-xl font-semibold tracking-tight">
              A good place to start
            </h2>
          </div>
          <span className="text-sm text-muted-foreground">
            {rooms?.length ?? 0} study {(rooms?.length ?? 0) === 1 ? 'room' : 'rooms'}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shortcuts.map(({ to, title, description, icon: Icon, action }) => (
            <Link key={to} to={to} className="group rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Card className="h-full rounded-2xl transition-colors group-hover:border-primary/40 group-hover:bg-accent/40">
                <CardContent className="flex h-full flex-col p-5 sm:p-6">
                  <span className="grid size-11 place-items-center rounded-xl bg-accent text-accent-foreground">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-5 font-semibold">{title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{description}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    {action}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
