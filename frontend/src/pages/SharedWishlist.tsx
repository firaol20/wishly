import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Lock, Loader2, Heart } from 'lucide-react';
import { wishlistsApi } from '../services/api';
import type { WishItem, Wishlist } from '../types';
import { Badge } from '../components/ui/Badge';
import { CATEGORY_LABELS, CATEGORY_COLORS, STATUS_LABELS, STATUS_COLORS } from '../utils/categoryColors';
import { WishlyIcon } from '../components/ui/WishlyLogo';

interface SharedData extends Wishlist {
  items: WishItem[];
  user: { name: string; avatarUrl?: string };
}

function WishlyWordmark() {
  return (
    <div className="flex items-center gap-2">
      <WishlyIcon size={26} />
      <span className="font-display text-lg text-stone-600">Wishly</span>
    </div>
  );
}

export function SharedWishlist() {
  const { token } = useParams<{ token: string }>();

  const { data, isLoading, isError } = useQuery<SharedData>({
    queryKey: ['shared', token],
    queryFn: () => wishlistsApi.getShared(token!).then(r => r.data),
    enabled: !!token,
    retry: false,
  });

  if (isLoading) return (
    <div className="min-h-screen bg-[#FFFBF0] flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-amber-400" />
    </div>
  );

  if (isError || !data) return (
    <div className="min-h-screen bg-[#FFFBF0] flex flex-col items-center justify-center gap-4 text-center px-4">
      <Lock size={40} className="text-stone-300" strokeWidth={1.5} />
      <h1 className="font-display text-2xl text-stone-600">This wishlist is private</h1>
      <p className="text-stone-400 text-sm max-w-xs">The link may have expired or the wishlist is no longer shared.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFFBF0]">
      {/* Header */}
      <header className="border-b border-stone-100 py-4 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <WishlyWordmark />
          <a href="/" className="text-xs text-amber-600 hover:underline">Create your own wishlist →</a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Cover + Title */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          {data.coverImageUrl && (
            <div className="h-52 rounded-2xl overflow-hidden mb-5">
              <img src={data.coverImageUrl} alt={data.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex items-center gap-3 mb-2">
            {data.user?.avatarUrl && (
              <img src={data.user.avatarUrl} alt={data.user.name} className="w-8 h-8 rounded-full" />
            )}
            <p className="text-sm text-stone-500">{data.user?.name}&apos;s wishlist</p>
          </div>
          <h1 className="font-display text-4xl text-stone-800">{data.title}</h1>
          {data.description && <p className="text-stone-500 mt-2">{data.description}</p>}
          <p className="text-xs text-stone-400 mt-2">{data.items.length} wishes</p>
        </motion.div>

        {/* Wishes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.items.map((wish, i) => (
            <motion.div
              key={wish.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm"
            >
              {wish.imageUrl && (
                <div className="h-32 overflow-hidden">
                  <img src={wish.imageUrl} alt={wish.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
              )}
              <div className="p-4 flex flex-col gap-2.5">
                <div className="flex gap-1.5 flex-wrap">
                  <Badge className={CATEGORY_COLORS[wish.category]}>{CATEGORY_LABELS[wish.category]}</Badge>
                  <Badge className={STATUS_COLORS[wish.status]}>{STATUS_LABELS[wish.status]}</Badge>
                </div>
                <h3 className="font-display font-semibold text-stone-800">{wish.title}</h3>
                {wish.whyIWantThis && (
                  <p className="text-xs text-stone-400 italic line-clamp-2">&quot;{wish.whyIWantThis}&quot;</p>
                )}
                {wish.status === 'LIVED_IT' && wish.memoryNote && (
                  <div className="bg-green-50 rounded-xl p-2.5 text-xs text-green-700 italic line-clamp-2 flex gap-1.5 items-start">
                    <Heart size={11} className="mt-0.5 flex-shrink-0 text-green-400 fill-green-300" />
                    <span>&quot;{wish.memoryNote}&quot;</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-100 py-8 text-center mt-10">
        <div className="flex items-center justify-center gap-2">
          <WishlyIcon size={18} />
          <p className="text-sm text-stone-400">
            Made with <a href="/" className="text-amber-500 hover:underline">Wishly</a> — Start your own dream sanctuary
          </p>
        </div>
      </footer>
    </div>
  );
}
