import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Star, Loader2, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { wishlistsApi, itemsApi } from '../services/api';
import type { WishItem, Wishlist } from '../types';
import { WishCard } from '../components/wishes/WishCard';
import { WishForm } from '../components/wishes/WishForm';
import { Button } from '../components/ui/Button';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'TRAVEL', label: '✈️ Travel' },
  { value: 'HEALTH', label: '💪 Health' },
  { value: 'CAREER', label: '🚀 Career' },
  { value: 'FAMILY', label: '👨‍👩‍👧 Family' },
  { value: 'EDUCATION', label: '📚 Education' },
  { value: 'FUN', label: '🎉 Fun' },
  { value: 'OTHER', label: '✨ Other' },
];

const STATUSES = [
  { value: '', label: 'All' },
  { value: 'DREAM', label: '💭 Dream' },
  { value: 'IN_PROGRESS', label: '🔥 In Progress' },
  { value: 'LIVED_IT', label: '✅ Lived It' },
];

export function Wishlists() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<WishItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  // Get user's wishlists to find the default one for creating wishes
  const { data: wishlists = [] } = useQuery<Wishlist[]>({
    queryKey: ['wishlists'],
    queryFn: () => wishlistsApi.list().then(r => r.data),
  });

  const defaultWishlistId = wishlists[0]?.id ?? '';

  // Fetch all user wishes (flat feed)
  const { data: wishes = [], isLoading } = useQuery<WishItem[]>({
    queryKey: ['wishes-mine'],
    queryFn: () => itemsApi.mine().then(r => r.data),
  });

  // Filter client-side for instant feedback
  const filtered = useMemo(() => {
    return wishes.filter(w => {
      const matchSearch = !search ||
        w.title.toLowerCase().includes(search.toLowerCase()) ||
        (w.whyIWantThis ?? '').toLowerCase().includes(search.toLowerCase());
      const matchCategory = !category || w.category === category;
      const matchStatus = !status || w.status === status;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [wishes, search, category, status]);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      itemsApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishes-mine'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
    onError: () => toast.error('Failed to update status'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => itemsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishes-mine'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Wish removed');
      setDeleteConfirm(null);
    },
    onError: () => toast.error('Failed to delete wish'),
  });

  const visibilityMutation = useMutation({
    mutationFn: ({ id, isPublic }: { id: string; isPublic: boolean }) =>
      itemsApi.toggleVisibility(id, isPublic),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['wishes-mine'] });
      toast.success(vars.isPublic ? 'Wish is now public ✨' : 'Wish is now private');
    },
    onError: () => toast.error('Failed to update visibility'),
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
              <Star size={13} className="text-amber-600 fill-amber-400" />
              {wishes.length} {wishes.length === 1 ? 'wish' : 'wishes'}
            </span>
          </div>
        </div>
        <Button
          onClick={() => { setEditing(null); setFormOpen(true); }}
          disabled={!defaultWishlistId}
        >
          <Plus size={16} />
          I wish…
        </Button>
      </div>

      {/* Search + Filters */}
      {wishes.length > 0 && (
        <div className="flex flex-col gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search wishes…"
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status pills */}
          <div className="flex gap-2 flex-wrap">
            {STATUSES.map(s => (
              <button
                key={s.value}
                onClick={() => setStatus(s.value === status ? '' : s.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                  status === s.value
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-amber-300'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Category pills */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value === category ? '' : c.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                  category === c.value
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-amber-300'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {wishes.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-5 py-20 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center">
            <Star size={36} className="text-amber-300" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-display text-xl text-stone-700">What do you wish for?</h2>
            <p className="text-stone-400 text-sm mt-1 max-w-xs">
              Capture your dreams — travel adventures, life goals, or meaningful aspirations.
            </p>
          </div>
          <Button
            onClick={() => { setEditing(null); setFormOpen(true); }}
            size="lg"
            disabled={!defaultWishlistId}
          >
            <Plus size={18} />
            Add my first wish
          </Button>
        </motion.div>
      )}

      {/* No filter results */}
      {wishes.length > 0 && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3 py-16 text-center"
        >
          <Search size={32} className="text-stone-300" />
          <p className="text-stone-400 text-sm">No wishes match your filters.</p>
          <button
            onClick={() => { setSearch(''); setCategory(''); setStatus(''); }}
            className="text-xs text-amber-600 hover:underline"
          >
            Clear filters
          </button>
        </motion.div>
      )}

      {/* Wish Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence>
          {filtered.map((w, i) => (
            <WishCard
              key={w.id}
              wish={w}
              index={i}
              onEdit={(wish) => { setEditing(wish); setFormOpen(true); }}
              onDelete={(id) => setDeleteConfirm(id)}
              onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
              onToggleVisibility={(id, isPublic) => visibilityMutation.mutate({ id, isPublic })}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Wish Form */}
      {defaultWishlistId && (
        <WishForm
          open={formOpen}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          wishlistId={defaultWishlistId}
          editing={editing}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ['wishes-mine'] });
            qc.invalidateQueries({ queryKey: ['stats'] });
          }}
        />
      )}

      {/* Delete confirm modal */}
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
              <h3 className="font-display text-lg text-stone-800 mb-2">Delete this wish?</h3>
              <p className="text-sm text-stone-500 mb-5">This wish will be permanently removed. This cannot be undone.</p>
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
