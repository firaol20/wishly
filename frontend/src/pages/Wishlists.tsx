import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookHeart, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { wishlistsApi } from '../services/api';
import type { Wishlist } from '../types';
import { WishlistCard } from '../components/wishlists/WishlistCard';
import { WishlistForm } from '../components/wishlists/WishlistForm';
import { Button } from '../components/ui/Button';

export function Wishlists() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Wishlist | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: wishlists = [], isLoading } = useQuery<Wishlist[]>({
    queryKey: ['wishlists'],
    queryFn: () => wishlistsApi.list().then(r => r.data),
  });

  const totalWishes = wishlists.reduce((acc, w) => acc + (w._count?.items ?? 0), 0);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => wishlistsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlists'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Dream collection deleted');
      setDeleteConfirm(null);
    },
    onError: () => toast.error('Failed to delete dream collection'),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-stone-800">I wish</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 shadow-xs">
              <Sparkles size={13} className="text-amber-600" />
              {totalWishes} {totalWishes === 1 ? 'wish' : 'wishes'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200">
              <BookHeart size={13} className="text-stone-500" />
              {wishlists.length} {wishlists.length === 1 ? 'collection' : 'collections'}
            </span>
          </div>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus size={16} />
          New wish collection
        </Button>
      </div>

      {/* Empty state */}
      {wishlists.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-5 py-20 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center">
            <BookHeart size={36} className="text-amber-300" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-display text-xl text-stone-700">Your dream space is empty</h2>
            <p className="text-stone-400 text-sm mt-1 max-w-xs">
              Create your first dream collection — travel adventures, life goals, or meaningful aspirations.
            </p>
          </div>
          <Button onClick={() => { setEditing(null); setFormOpen(true); }} size="lg">
            <Plus size={18} />
            Create my first dream
          </Button>
        </motion.div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence>
          {wishlists.map((w, i) => (
            <WishlistCard
              key={w.id}
              wishlist={w}
              index={i}
              onEdit={(wl) => { setEditing(wl); setFormOpen(true); }}
              onDelete={(id) => setDeleteConfirm(id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Form */}
      <WishlistForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        editing={editing}
      />

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
            />
            <motion.div
              className="relative bg-[#FFFBF0] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            >
              <h3 className="font-display text-lg text-stone-800 mb-2">Delete this wishlist?</h3>
              <p className="text-sm text-stone-500 mb-5">All wishes inside will be permanently deleted. This cannot be undone.</p>
              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                <Button variant="danger" className="flex-1" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleteConfirm)}>Delete</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
