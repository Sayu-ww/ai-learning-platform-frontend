import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@components/ui/button';
import { Card, CardContent } from '@components/ui/card';

export default function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-12">
      <Card className="w-full max-w-lg rounded-3xl">
        <CardContent className="p-8 text-center sm:p-12">
          <p className="text-sm font-semibold tracking-wide text-primary">404 · PAGE NOT FOUND</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            This page wandered off.
          </h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            The link may be outdated, or the page may have moved.
          </p>
          <Button className="mt-7 rounded-xl" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 size-4" />
            Go back
          </Button>
          <Link to="/" className="mt-4 block text-sm font-medium text-primary hover:underline">
            Return to the start
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
