import type { ReactNode } from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@components/theme-toggle';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen bg-background">
      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex xl:p-14">
          <div className="absolute -right-24 -top-24 size-96 rounded-full bg-white/10" />
          <div className="absolute -bottom-40 -left-20 size-96 rounded-full bg-white/10" />
          <div className="relative flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-white/15">
              <BookOpen className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-bold">LearnTogether</span>
              <span className="block text-xs text-primary-foreground/70">Study, in sync</span>
            </span>
          </div>

          <div className="relative max-w-xl py-16">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm">
              <Sparkles className="size-4" />
              A better way to learn together
            </span>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
              Good ideas grow when we learn together.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-primary-foreground/75">
              Find your people, join a study room, and make progress at a pace that works for you.
            </p>
          </div>

          <p className="relative text-sm text-primary-foreground/65">
            Your next learning session starts here.
          </p>
        </section>

        <section className="flex min-h-screen items-center justify-center px-4 py-20 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <span className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground">
                <BookOpen className="size-5" />
              </span>
              <span className="text-lg font-bold tracking-tight">LearnTogether</span>
            </div>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
