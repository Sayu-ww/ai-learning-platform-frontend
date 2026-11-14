import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { authApi } from '@lib/api/auth.api';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';

export default function ProfilePage() {
  const { data: account, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getCurrentUser,
  });

  const name = account?.profile?.displayName || account?.user?.email?.split('@')[0] || 'Learner';

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium text-primary">Your account</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The details associated with your learning account.
        </p>
      </header>

      <Card className="max-w-3xl rounded-3xl">
        <CardHeader className="border-b p-5 sm:p-7">
          <div className="flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground">
              <UserRound className="size-6" />
            </span>
            <div className="min-w-0">
              <CardTitle className="truncate text-xl">{isLoading ? 'Loading profile...' : name}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {account?.user?.role || 'Learner'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
          <div className="flex min-w-0 items-start gap-3">
            <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Email
              </p>
              <p className="mt-1 truncate text-sm font-medium">
                {account?.user?.email || 'Not available'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Account type
              </p>
              <p className="mt-1 text-sm font-medium capitalize">
                {account?.user?.role || 'Learner'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 sm:col-span-2">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Member since
              </p>
              <p className="mt-1 text-sm font-medium">
                {account?.user?.createdAt
                  ? new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(
                      new Date(account.user.createdAt),
                    )
                  : 'Not available'}
              </p>
            </div>
          </div>
          <p className="text-sm leading-6 text-muted-foreground sm:col-span-2">
            Profile editing will be available in a future update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
