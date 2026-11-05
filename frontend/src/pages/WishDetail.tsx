import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Tag, Heart, Loader2 } from 'lucide-react';
import { itemsApi } from '../services/api';
import type { WishItem } from '../types';
import { Badge } from '../components/ui/Badge';
import { CATEGORY_LABELS, CATEGORY_COLORS, STATUS_LABELS, STATUS_COLORS } from '../utils/categoryColors';

type WishWithList = WishItem & { wishlist: { title: string; id: string } };

export function WishDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: wish, isLoading } = useQuery<WishWithList>({
    queryKey: ['wish', id],
    queryFn: () => itemsApi.get(id!).then(r => r.data),
    enabled: !!id,
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={32} className="animate-spin text-amber-400" />
    </div>
  );
  if (!wish) return <div className="text-center text-stone-500 py-20">Wish not found</div>;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <Link
        to={`/wishlists/${wish.wishlist?.id}`}
        className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 w-fit"
      >
        <ArrowLeft size={14} /> Back to {wish.wishlist?.title}
      </Link>

      {wish.imageUrl && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden h-64"
        >
          <img src={wish.imageUrl} alt={wish.title} className="w-full h-full object-cover" />
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
        {/* Badges */}
        <div className="flex gap-2 flex-wrap">
          <Badge className={CATEGORY_COLORS[wish.category]}>{CATEGORY_LABELS[wish.category]}</Badge>
          <Badge className={STATUS_COLORS[wish.status]}>{STATUS_LABELS[wish.status]}</Badge>
          <Badge className="bg-stone-100 text-stone-500">{wish.priority} priority</Badge>
        </div>

        {/* Title */}
        <h1 className={`font-display text-3xl text-stone-800 leading-tight ${wish.status === 'LIVED_IT' ? 'line-through decoration-stone-300' : ''}`}>
          {wish.title}
        </h1>

        {/* Why */}
        {wish.whyIWantThis && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">Why I want this</p>
            <p className="text-stone-700 italic leading-relaxed">&quot;{wish.whyIWantThis}&quot;</p>
          </div>
        )}

        {/* Meta */}
        <div className="flex flex-col gap-2">
          {wish.targetDate && (
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <Calendar size={15} className="text-amber-400" />
              Target: {new Date(wish.targetDate).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
              })}
            </div>
          )}
          {wish.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag size={13} className="text-stone-400" />
              {wish.tags.map(tag => (
                <span key={tag} className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">#{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Memory capsule */}
        {wish.status === 'LIVED_IT' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-green-50 border border-green-100 rounded-2xl p-5 flex flex-col gap-4"
          >
            <div className="flex items-center gap-2">
              <Heart size={15} className="text-green-500 fill-green-300" />
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Memory Capsule</p>
            </div>
            {wish.memoryImageUrl && (
              <img src={wish.memoryImageUrl} alt="Memory" className="w-full rounded-xl object-cover max-h-60" />
            )}
            {wish.memoryNote && (
              <p className="text-stone-700 italic leading-relaxed">&quot;{wish.memoryNote}&quot;</p>
            )}
            {wish.completedAt && (
              <p className="text-xs text-green-500">
                Lived on {new Date(wish.completedAt).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric',
                })}
              </p>
            )}
            {!wish.memoryNote && !wish.memoryImageUrl && (
              <p className="text-sm text-stone-400 italic">No memory added yet.</p>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
