import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@components/ui/card';

export default function CoursesPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium text-primary">Keep growing</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Courses</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          A place for structured learning paths and shared progress.
        </p>
      </header>

      <Card className="overflow-hidden rounded-3xl">
        <CardContent className="grid gap-8 p-6 sm:p-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground">
              <Sparkles className="size-3.5" />
              In the works
            </span>
            <h2 className="mt-5 max-w-lg text-2xl font-semibold tracking-tight sm:text-3xl">
              Your next learning path is taking shape.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
              Courses are still being built. For now, start a room, share a video, and learn with
              your group.
            </p>
            <Link
              to="/rooms"
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Explore study rooms
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid min-h-52 place-items-center rounded-2xl bg-accent/60 p-8 text-accent-foreground">
            <div className="text-center">
              <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-background shadow-sm">
                <BookOpen className="size-7" />
              </span>
              <p className="mt-4 text-sm font-medium">Learning paths are coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
