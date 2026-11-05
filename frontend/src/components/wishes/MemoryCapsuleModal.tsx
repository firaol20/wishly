import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Heart, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { itemsApi } from '../../services/api';
import type { WishItem } from '../../types';
import { Modal } from '../ui/Modal';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { ImageUpload } from '../ui/ImageUpload';

interface MemoryCapsuleModalProps {
  open: boolean;
  onClose: () => void;
  wish: WishItem | null;
  wishlistId: string;
}

export function MemoryCapsuleModal({ open, onClose, wish, wishlistId }: MemoryCapsuleModalProps) {
  const qc = useQueryClient();
  const [note, setNote] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (open) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#F59E0B', '#FDE68A', '#D97706', '#FCA5A5', '#86EFAC'],
      });
      setNote('');
      setImageUrl('');
    }
  }, [open]);

  const mutation = useMutation({
    mutationFn: () =>
      itemsApi.addMemory(wish!.id, {
        memoryNote: note,
        memoryImageUrl: imageUrl || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishes', wishlistId] });
      qc.invalidateQueries({ queryKey: ['wish', wish!.id] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Memory saved!');
      onClose();
    },
    onError: () => toast.error('Failed to save memory'),
  });

  if (!wish) return null;

  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="flex flex-col items-center gap-5 text-center">
        {/* Celebration icon */}
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center"
        >
          <Star size={32} className="text-amber-500 fill-amber-300" strokeWidth={1.5} />
        </motion.div>

        <div>
          <h2 className="font-display text-2xl text-stone-800">You lived this dream!</h2>
          <p className="text-stone-500 mt-1 text-sm">&quot;{wish.title}&quot;</p>
        </div>

        <div className="w-full text-left flex flex-col gap-4">
          <Textarea
            label="How did it feel?"
            placeholder="It was absolutely incredible. I remember standing at the top and feeling..."
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={4}
          />
          <ImageUpload
            label="Capture the moment (optional)"
            value={imageUrl}
            onChange={setImageUrl}
          />
        </div>

        <div className="flex gap-2 w-full">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Skip for now
          </Button>
          <Button
            className="flex-1"
            onClick={() => mutation.mutate()}
            loading={mutation.isPending}
            disabled={!note.trim()}
          >
            <Heart size={15} />
            Save memory
          </Button>
        </div>
      </div>
    </Modal>
  );
}
