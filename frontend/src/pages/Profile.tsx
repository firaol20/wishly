import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import { usersApi } from '../services/api';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  bio: z.string().max(500).optional(),
});

type FormData = z.infer<typeof schema>;

export function Profile() {
  const { user, signOut } = useAuth();
  const { setUser } = useAuthStore();
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name || '', bio: user?.bio || '' },
  });

  useEffect(() => {
    if (user) reset({ name: user.name, bio: user.bio || '' });
  }, [user, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => usersApi.updateMe(data),
    onSuccess: ({ data }) => {
      setUser(data);
      toast.success('Profile updated ✨');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const exportMutation = useMutation({
    mutationFn: () => usersApi.exportData(),
    onSuccess: ({ data }) => {
      const url = URL.createObjectURL(data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wishly-export.json';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => usersApi.deleteAccount(),
    onSuccess: () => {
      signOut();
      navigate('/');
      toast.success('Account deleted. Goodbye 🌙');
    },
    onError: () => toast.error('Failed to delete account'),
  });

  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl text-stone-800">Profile</h1>
        <p className="text-stone-500 mt-1 text-sm">Manage your account settings</p>
      </motion.div>

      {/* Avatar */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-stone-100 p-6 flex items-center gap-4"
      >
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full border-2 border-amber-200 object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-2xl">
            {user.name[0]}
          </div>
        )}
        <div>
          <p className="font-semibold text-stone-800">{user.name}</p>
          <p className="text-sm text-stone-400">{user.email}</p>
          <p className="text-xs text-stone-300 mt-0.5">Avatar synced from Google</p>
        </div>
      </motion.div>

      {/* Profile form */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl border border-stone-100 p-6"
      >
        <h2 className="font-semibold text-stone-700 mb-4">Edit Profile</h2>
        <form onSubmit={handleSubmit(d => updateMutation.mutate(d))} className="flex flex-col gap-4">
          <Input label="Display Name" error={errors.name?.message} {...register('name')} />
          <Textarea label="Bio (optional)" placeholder="A dreamer who loves adventures..." rows={3} {...register('bio')} />
          <Button type="submit" loading={updateMutation.isPending} disabled={!isDirty}>
            Save changes
          </Button>
        </form>
      </motion.div>

      {/* Data */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-stone-100 p-6"
      >
        <h2 className="font-semibold text-stone-700 mb-1">Your Data</h2>
        <p className="text-sm text-stone-400 mb-4">Download everything Wishly stores about you.</p>
        <Button variant="secondary" onClick={() => exportMutation.mutate()} loading={exportMutation.isPending}>
          Export my data (JSON)
        </Button>
      </motion.div>

      {/* Danger zone */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-white rounded-2xl border border-red-100 p-6"
      >
        <h2 className="font-semibold text-red-600 mb-1">Danger Zone</h2>
        <p className="text-sm text-stone-400 mb-4">Permanently delete your account and all your wishes. This cannot be undone.</p>
        {!deleteConfirm ? (
          <Button variant="danger" onClick={() => setDeleteConfirm(true)}>Delete my account</Button>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-stone-600">Type <strong>delete my account</strong> to confirm:</p>
            <input
              type="text"
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              placeholder="delete my account"
              className="rounded-xl border border-red-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => { setDeleteConfirm(false); setDeleteInput(''); }}>Cancel</Button>
              <Button
                variant="danger"
                className="flex-1"
                disabled={deleteInput !== 'delete my account'}
                loading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate()}
              >
                Delete forever
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
