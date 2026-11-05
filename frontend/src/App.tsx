import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Loader2, MoonStar } from 'lucide-react';
import { useAuthStore } from './store/authStore';
import { AppLayout } from './components/layout/AppLayout';
import { Landing } from './pages/Landing';
import { AuthCallback } from './pages/AuthCallback';
import { Dashboard } from './pages/Dashboard';
import { Wishlists } from './pages/Wishlists';
import { WishlistDetail } from './pages/WishlistDetail';
import { WishDetail } from './pages/WishDetail';
import { Profile } from './pages/Profile';
import { SharedWishlist } from './pages/SharedWishlist';
import { useAuth } from './hooks/useAuth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 2,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFBF0] flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-amber-400" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/share/:token" element={<SharedWishlist />} />

      {/* Protected */}
      <Route element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/wishlists" element={<Wishlists />} />
        <Route path="/wishlists/:id" element={<WishlistDetail />} />
        <Route path="/wishes/:id" element={<WishDetail />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={
        <div className="min-h-screen bg-[#FFFBF0] flex flex-col items-center justify-center gap-4 text-center">
          <MoonStar size={48} className="text-stone-300" strokeWidth={1.5} />
          <h1 className="font-display text-3xl text-stone-700">Page not found</h1>
          <a href="/" className="text-amber-600 hover:underline text-sm">Go back home →</a>
        </div>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
