import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { isAxiosError } from 'axios';
import { Link } from 'react-router-dom';
import { useRegister } from '@hooks/useAuth';
import AuthLayout from '@components/auth/AuthLayout';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@components/ui/card';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const register = useRegister();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    register.mutate({ email, password, displayName });
  };

  const errorMessage = isAxiosError(register.error)
    ? String(register.error.response?.data?.message ?? 'Registration failed. Please try again.')
    : 'Registration failed. Please try again.';

  return (
    <AuthLayout>
      <Card className="border-border/70 shadow-xl shadow-foreground/5">
        <CardHeader className="space-y-2 pb-5">
          <CardTitle className="text-2xl font-semibold tracking-tight">Create your account</CardTitle>
          <CardDescription>Join a room and make learning a shared habit.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Your name</Label>
              <Input
                id="displayName"
                name="displayName"
                type="text"
                placeholder="Alex Morgan"
                autoComplete="name"
                required
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
            </div>

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
                placeholder="At least 6 characters"
                autoComplete="new-password"
                minLength={6}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {register.isError && (
              <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 p-3">
                <p className="text-sm text-destructive">{errorMessage}</p>
              </div>
            )}

            <Button type="submit" disabled={register.isPending} className="w-full rounded-xl">
              {register.isPending ? 'Creating account...' : 'Create account'}
              {!register.isPending && <ArrowRight className="ml-2 size-4" />}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t px-6 py-5">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
