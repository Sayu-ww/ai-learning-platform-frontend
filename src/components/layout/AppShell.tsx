import { useState } from 'react';
import { BookOpen, DoorOpen, LayoutDashboard, LogOut, Menu, UserRound } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Button } from '@components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@components/ui/sheet';
import { ThemeToggle } from '@components/theme-toggle';
import { useLogout } from '@hooks/useAuth';
import { useAuthStore } from '@stores/auth.store';
import { cn } from '@lib/utils';

const navigation = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/rooms', label: 'Study rooms', icon: DoorOpen },
  { to: '/courses', label: 'Courses', icon: BookOpen },
];

function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="grid gap-1">
      {navigation.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )
          }
        >
          <Icon className="size-4 shrink-0" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/dashboard" className="flex items-center gap-3" aria-label="Learning Platform home">
      <span className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
        <BookOpen className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold tracking-tight">LearnTogether</span>
        <span className="block text-xs text-muted-foreground">Study, in sync</span>
      </span>
    </Link>
  );
}

export default function AppShell() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-card px-5 py-6 lg:flex">
        <Brand />
        <p className="mb-3 mt-10 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Workspace
        </p>
        <NavigationLinks />

        <div className="mt-auto rounded-2xl border bg-muted/50 p-4">
          <p className="text-sm font-semibold">Make time to learn</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Pick a room and keep your learning moving.
          </p>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b bg-background/90 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-xl lg:hidden"
                  aria-label="Open navigation"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetTitle className="mb-8 pr-10">
                  <Brand />
                </SheetTitle>
                <NavigationLinks onNavigate={() => setMenuOpen(false)} />
              </SheetContent>
            </Sheet>
            <div className="lg:hidden">
              <Brand />
            </div>
            <span className="hidden text-sm text-muted-foreground lg:block">
              Your learning space
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-3">
            <ThemeToggle />
            <Link
              to="/profile"
              className="hidden items-center gap-2 rounded-xl px-2 py-1.5 text-sm hover:bg-muted sm:flex"
            >
              <span className="grid size-8 place-items-center rounded-full bg-accent text-accent-foreground">
                <UserRound className="size-4" />
              </span>
              <span className="max-w-40 truncate text-muted-foreground">{user?.email}</span>
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Sign out"
              title="Sign out"
              disabled={logout.isPending}
              onClick={() => logout.mutate()}
              className="rounded-xl text-muted-foreground"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>

        <main className="w-full flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
