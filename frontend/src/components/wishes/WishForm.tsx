import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Sparkles, X } from 'lucide-react';
import { itemsApi, aiApi } from '../../services/api';
import type { WishItem, Category } from '../../types';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { ImageUpload } from '../ui/ImageUpload';
import { Modal } from '../ui/Modal';
import { CATEGORIES, CATEGORY_LABELS } from '../../utils/categoryColors';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  whyIWantThis: z.string().max(1000).optional(),
  imageUrl: z.string().optional(),
  category: z.enum(['TRAVEL', 'HEALTH', 'CAREER', 'FAMILY', 'EDUCATION', 'FUN', 'OTHER']).optional(),
  tags: z.array(z.string()).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  targetDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface WishFormProps {
  open: boolean;
  onClose: () => void;
  wishlistId: string;
  editing?: WishItem | null;
}

export function WishForm({ open, onClose, wishlistId, editing }: WishFormProps) {
  const qc = useQueryClient();
  const isEdit = !!editing;
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{ category: Category; tags: string[] } | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', whyIWantThis: '', category: 'OTHER', priority: 'MEDIUM', targetDate: '' },
  });

  useEffect(() => {
    if (editing) {
      reset({
        title: editing.title,
        whyIWantThis: editing.whyIWantThis || '',
        imageUrl: editing.imageUrl || '',
        category: editing.category,
        priority: editing.priority,
        targetDate: editing.targetDate ? editing.targetDate.split('T')[0] : '',
      });
      setTags(editing.tags || []);
    } else {
      reset({ title: '', whyIWantThis: '', imageUrl: '', category: 'OTHER', priority: 'MEDIUM', targetDate: '' });
      setTags([]);
    }
    setAiSuggestion(null);
  }, [editing, reset, open]);

  const fetchAiSuggestion = useCallback(async (title: string) => {
    if (title.length < 4) return;
    setAiLoading(true);
    try {
      const { data } = await aiApi.suggest(title);
      setAiSuggestion(data);
    } catch {
      // Silently fail
    } finally {
      setAiLoading(false);
    }
  }, []);

  const titleValue = watch('title');
  useEffect(() => {
    if (isEdit) return;
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => fetchAiSuggestion(titleValue), 600);
    setDebounceTimer(timer);
    return () => clearTimeout(timer);
  }, [titleValue, isEdit]); // eslint-disable-line react-hooks/exhaustive-deps

  const acceptAiSuggestion = () => {
    if (!aiSuggestion) return;
    setValue('category', aiSuggestion.category);
    setTags(prev => [...new Set([...prev, ...aiSuggestion.tags])]);
    setAiSuggestion(null);
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  };

  const createMutation = useMutation({
    mutationFn: (data: FormData) =>
      itemsApi.create(wishlistId, {
        ...data,
        tags,
        targetDate: data.targetDate ? new Date(data.targetDate).toISOString() : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishes', wishlistId] });
      toast.success('Wish added ✨');
      onClose();
    },
    onError: () => toast.error('Failed to add wish'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData) =>
      itemsApi.update(editing!.id, {
        ...data,
        tags,
        targetDate: data.targetDate ? new Date(data.targetDate).toISOString() : null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishes', wishlistId] });
      qc.invalidateQueries({ queryKey: ['wish', editing!.id] });
      toast.success('Wish updated');
      onClose();
    },
    onError: () => toast.error('Failed to update wish'),
  });

  const onSubmit = (data: FormData) => {
    if (isEdit) updateMutation.mutate(data);
    else createMutation.mutate(data);
  };

  const imageUrl = watch('imageUrl');
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Wish' : 'Add a Wish'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="relative">
          <Input
            label="What do you wish for?"
            placeholder="Hike the Inca Trail..."
            error={errors.title?.message}
            {...register('title')}
          />
          {aiSuggestion && !isEdit && (
            <div className="mt-2 flex items-center gap-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200">
              <Sparkles size={14} className="text-amber-500 flex-shrink-0" />
              <div className="flex-1 text-xs text-stone-600">
                <span className="font-medium">AI suggests:</span>{' '}
                <span className="text-amber-700">{aiSuggestion.category}</span>
                {aiSuggestion.tags.length > 0 && (
                  <span className="text-stone-400"> · {aiSuggestion.tags.join(', ')}</span>
                )}
              </div>
              <button type="button" onClick={acceptAiSuggestion} className="text-xs text-amber-700 font-medium hover:underline">Accept</button>
              <button type="button" onClick={() => setAiSuggestion(null)} className="text-stone-400 hover:text-stone-600" aria-label="Dismiss"><X size={12} /></button>
            </div>
          )}
          {aiLoading && !isEdit && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-stone-400">
              <Sparkles size={12} className="animate-pulse text-amber-400" />
              AI is thinking...
            </div>
          )}
        </div>

        <Textarea
          label="Why do you want this?"
          placeholder="To challenge myself and see the world from a different angle..."
          rows={3}
          {...register('whyIWantThis')}
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-stone-700">Category</label>
            <select {...register('category')} className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400">
              {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-stone-700">Priority</label>
            <select {...register('priority')} className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400">
              <option value="LOW">🟢 Low</option>
              <option value="MEDIUM">🟡 Medium</option>
              <option value="HIGH">🔴 High</option>
            </select>
          </div>
        </div>

        <Input label="Target Date (optional)" type="date" {...register('targetDate')} />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-stone-700">Tags</label>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              placeholder="Add a tag..."
              className="flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <Button type="button" variant="secondary" size="sm" onClick={addTag}>Add</Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 text-xs">
                  #{tag}
                  <button type="button" onClick={() => setTags(prev => prev.filter(t => t !== tag))} className="text-stone-400 hover:text-stone-600" aria-label={`Remove tag ${tag}`}><X size={10} /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        <ImageUpload label="Wish Image (optional)" value={imageUrl} onChange={url => setValue('imageUrl', url)} />

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" loading={isPending}>{isEdit ? 'Save changes' : 'Add wish ✨'}</Button>
        </div>
      </form>
    </Modal>
  );
}
