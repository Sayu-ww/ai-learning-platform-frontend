import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLogin } from '@hooks/useAuth';
import AuthLayout from '@components/auth/AuthLayout';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@components/ui/card';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    login.mutate({ email, password });
  };

  return (
    <AuthLayout>
      <Card className="border-border/70 shadow-xl shadow-foreground/5">
        <CardHeader className="space-y-2 pb-5">
          <CardTitle className="text-2xl font-semibold tracking-tight">Welcome back</CardTitle>
          <CardDescription>Sign in to pick up where you left off.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {login.isError && (
              <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 p-3">
                <p className="text-sm text-destructive">Invalid credentials. Please try again.</p>
              </div>
            )}

            <Button type="submit" disabled={login.isPending} className="w-full rounded-xl">
              {login.isPending ? 'Signing in...' : 'Sign in'}
              {!login.isPending && <ArrowRight className="ml-2 size-4" />}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t px-6 py-5">
          <p className="text-sm text-muted-foreground">
            New to LearnTogether?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
