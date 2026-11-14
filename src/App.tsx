import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from '@stores/auth.store';
import { useSocket } from '@hooks/useSocket';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import RoomPage from './pages/rooms/RoomPage';
import RoomsListPage from './pages/rooms/RoomsListPage';
import CoursesPage from './pages/courses/CoursesPage';
import ProfilePage from './pages/profile/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import AppShell from '@components/layout/AppShell';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useSocket();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {isAuthenticated ? (
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/rooms" element={<RoomsListPage />} />
          <Route path="/rooms/:roomId" element={<RoomPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      ) : (
        <Route path="*" element={<LoginPage />} />
      )}

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
