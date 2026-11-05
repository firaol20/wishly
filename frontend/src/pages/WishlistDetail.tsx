import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Share2, Check, ArrowLeft,
  Download, Loader2, MessageSquareDashed,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { wishlistsApi, itemsApi } from '../services/api';
import type { Wishlist, WishItem, Status, Category } from '../types';
import { WishCard } from '../components/wishes/WishCard';
import { WishForm } from '../components/wishes/WishForm';
import { MemoryCapsuleModal } from '../components/wishes/MemoryCapsuleModal';
import { Button } from '../components/ui/Button';
import { STATUSES, STATUS_LABELS, CATEGORIES, CATEGORY_LABELS } from '../utils/categoryColors';

export function WishlistDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const [wishFormOpen, setWishFormOpen] = useState(false);
  const [editingWish, setEditingWish] = useState<WishItem | null>(null);
  const [memoryWish, setMemoryWish] = useState<WishItem | null>(null);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<Status | ''>('');
  const [filterCategory, setFilterCategory] = useState<Category | ''>('');
  const [copied, setCopied] = useState(false);

  const { data: wishlist, isLoading: wlLoading } = useQuery<Wishlist>({
    queryKey: ['wishlist', id],
    queryFn: () => wishlistsApi.get(id!).then(r => r.data),
    enabled: !!id,
  });

  const queryParams: Record<string, string> = {};
  if (filterStatus) queryParams.status = filterStatus;
  if (filterCategory) queryParams.category = filterCategory;
  if (searchQuery) queryParams.search = searchQuery;

  const { data: wishes = [], isLoading: wishesLoading } = useQuery<WishItem[]>({
    queryKey: ['wishes', id, queryParams],
    queryFn: () => itemsApi.list(id!, queryParams).then(r => r.data),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: ({ wishId, status }: { wishId: string; status: string }) =>
      itemsApi.updateStatus(wishId, status),
    onSuccess: (_, { wishId, status }) => {
      qc.invalidateQueries({ queryKey: ['wishes', id] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      if (status === 'LIVED_IT') {
        const wish = wishes.find(w => w.id === wishId);
        if (wish) { setMemoryWish(wish); setMemoryOpen(true); }
      }
    },
    onError: () => toast.error('Failed to update status'),
  });

  const deleteMutation = useMutation({
    mutationFn: (wishId: string) => itemsApi.delete(wishId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishes', id] });
      toast.success('Wish deleted');
      setDeleteConfirm(null);
    },
  });

  const copyShareLink = async () => {
    if (wishlist?.visibility !== 'LINK') {
      await wishlistsApi.update(id!, { visibility: 'LINK' });
      qc.invalidateQueries({ queryKey: ['wishlist', id] });
    }
    const token = wishlist?.shareToken;
    if (token) {
      navigator.clipboard.writeText(`${window.location.origin}/share/${token}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Link copied!');
    }
  };

  if (wlLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={32} className="animate-spin text-amber-400" />
    </div>
  );
  if (!wishlist) return <div className="text-center text-stone-500 py-20">Wishlist not found</div>;

  return (
    <div className="flex flex-col gap-6">
      {/* Back + Header */}
      <div className="flex flex-col gap-3">
        <Link to="/wishlists" className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 w-fit">
          <ArrowLeft size={14} /> All wishlists
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {wishlist.coverImageUrl && (
              <div className="h-40 rounded-2xl overflow-hidden mb-3">
                <img src={wishlist.coverImageUrl} alt={wishlist.title} className="w-full h-full object-cover" />
              </div>
            )}
            <h1 className="font-display text-3xl text-stone-800">{wishlist.title}</h1>
            {wishlist.description && <p className="text-stone-500 mt-1 text-sm">{wishlist.description}</p>}
            <p className="text-xs text-stone-400 mt-1.5">{wishes.length} wishes</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
            <Button variant="secondary" size="sm" onClick={copyShareLink}>
              {copied ? <Check size={14} /> : <Share2 size={14} />}
              {copied ? 'Copied!' : 'Share'}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => window.open(`/api/v1/wishlists/${id}/export/pdf`, '_blank')}>
              <Download size={14} />
              PDF
            </Button>
            <Button size="sm" onClick={() => { setEditingWish(null); setWishFormOpen(true); }}>
              <Plus size={14} /> Add wish
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            placeholder="Search wishes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            aria-label="Search wishes"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterStatus('')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterStatus === '' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
          >
            All
          </button>
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterStatus === s ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
          <div className="w-px bg-stone-200 mx-1 flex-shrink-0" />
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setFilterCategory(filterCategory === c ? '' : c)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterCategory === c ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Wishes */}
      {wishesLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 size={28} className="animate-spin text-amber-400" />
        </div>
      ) : wishes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4 py-20 text-center"
        >
          <MessageSquareDashed size={48} className="text-stone-200" strokeWidth={1.2} />
          <div>
            <h3 className="font-display text-lg text-stone-600">
              {filterStatus || filterCategory || searchQuery ? 'No wishes match your filters' : 'No wishes yet'}
            </h3>
            <p className="text-stone-400 text-sm mt-1">
              {filterStatus || filterCategory || searchQuery
                ? 'Try clearing your filters'
                : 'Add your first wish to this collection'}
            </p>
          </div>
          {!filterStatus && !filterCategory && !searchQuery && (
            <Button onClick={() => { setEditingWish(null); setWishFormOpen(true); }}>
              <Plus size={15} /> Add first wish
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AnimatePresence>
            {wishes.map((w, i) => (
              <WishCard
                key={w.id}
                wish={w}
                index={i}
                onEdit={(wish) => { setEditingWish(wish); setWishFormOpen(true); }}
                onDelete={(wishId) => setDeleteConfirm(wishId)}
                onStatusChange={(wishId, status) => statusMutation.mutate({ wishId, status })}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <WishForm open={wishFormOpen} onClose={() => { setWishFormOpen(false); setEditingWish(null); }} wishlistId={id!} editing={editingWish} />
      <MemoryCapsuleModal open={memoryOpen} onClose={() => setMemoryOpen(false)} wish={memoryWish} wishlistId={id!} />

      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div className="absolute inset-0 bg-black/30 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirm(null)} />
            <motion.div className="relative bg-[#FFFBF0] rounded-2xl p-6 max-w-sm w-full shadow-2xl" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <h3 className="font-display text-lg text-stone-800 mb-2">Delete this wish?</h3>
              <p className="text-sm text-stone-500 mb-5">This cannot be undone. Memories included.</p>
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
