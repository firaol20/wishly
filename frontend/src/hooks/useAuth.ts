import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { usersApi, authApi, API_ORIGIN } from '../services/api';

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, setAccessToken, logout } = useAuthStore();

  useEffect(() => {
    // Try to refresh token on mount to restore session
    const init = async () => {
      try {
        const { data } = await authApi.refresh();
        setAccessToken(data.accessToken);
        const { data: userData } = await usersApi.getMe();
        setUser(userData);
      } catch {
        logout();
      }
    };
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signInWithGoogle = () => {
    window.location.href = `${API_ORIGIN}/api/v1/auth/google`;
  };

  const signOut = async () => {
    try {
      await authApi.logout();
    } finally {
      logout();
    }
  };

  return { user, isAuthenticated, isLoading, signInWithGoogle, signOut };
}
