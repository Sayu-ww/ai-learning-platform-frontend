import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@stores/auth.store';
import { useEffect } from 'react';

export default function HomePage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return null;
}
