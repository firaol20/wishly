import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { usersApi } from '../services/api';

export function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setAccessToken, setUser, logout } = useAuthStore();

  useEffect(() => {
    const token = params.get('token');
    const error = params.get('error');

    if (error || !token) {
      logout();
      navigate('/?error=auth_failed');
      return;
    }

    setAccessToken(token);

    usersApi.getMe()
      .then(({ data }) => {
        setUser(data);
        navigate('/dashboard', { replace: true });
      })
      .catch(() => {
        logout();
        navigate('/');
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[#FFFBF0] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={36} className="animate-spin text-amber-400" />
        <p className="font-display text-stone-600 text-lg">Signing you in...</p>
      </div>
    </div>
  );
}
