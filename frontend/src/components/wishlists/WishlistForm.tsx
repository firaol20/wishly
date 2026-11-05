import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Lock, Link2 } from 'lucide-react';
import { wishlistsApi } from '../../services/api';
import type { Wishlist } from '../../types';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { ImageUpload } from '../ui/ImageUpload';
import { Modal } from '../ui/Modal';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  coverImageUrl: z.string().optional(),
  visibility: z.enum(['PRIVATE', 'LINK']).optional(),
});

type FormData = z.infer<typeof schema>;

interface WishlistFormProps {
  open: boolean;
  onClose: () => void;
  editing?: Wishlist | null;
}

export function WishlistForm({ open, onClose, editing }: WishlistFormProps) {
  const qc = useQueryClient();
  const isEdit = !!editing;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', coverImageUrl: '', visibility: 'PRIVATE' },
  });

  useEffect(() => {
    if (editing) {
      reset({
        title: editing.title,
        description: editing.description || '',
        coverImageUrl: editing.coverImageUrl || '',
        visibility: editing.visibility,
      });
    } else {
      reset({ title: '', description: '', coverImageUrl: '', visibility: 'PRIVATE' });
    }
  }, [editing, reset]);

  const createMutation = useMutation({
    mutationFn: (data: FormData) => wishlistsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlists'] });
      toast.success('Wishlist created');
      onClose();
    },
    onError: () => toast.error('Failed to create wishlist'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => wishlistsApi.update(editing!.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlists'] });
      qc.invalidateQueries({ queryKey: ['wishlist', editing!.id] });
      toast.success('Wishlist updated');
      onClose();
    },
    onError: () => toast.error('Failed to update wishlist'),
  });

  const onSubmit = (data: FormData) => {
    if (isEdit) updateMutation.mutate(data);
    else createMutation.mutate(data);
  };

  const coverImageUrl = watch('coverImageUrl');
  const currentVisibility = watch('visibility');
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Wishlist' : 'New Wishlist'}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Title"
          placeholder="My Travel Dreams..."
          error={errors.title?.message}
          {...register('title')}
        />
        <Textarea
          label="Description (optional)"
          placeholder="A collection of places I dream of visiting..."
          rows={2}
          {...register('description')}
        />
        <ImageUpload
          label="Cover Image (optional)"
          value={coverImageUrl}
          onChange={url => setValue('coverImageUrl', url)}
        />

        {/* Visibility toggle */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-stone-700">Visibility</label>
          <div className="flex gap-2">
            {([
              { value: 'PRIVATE', label: 'Private', Icon: Lock },
              { value: 'LINK',    label: 'Shared link', Icon: Link2 },
            ] as const).map(({ value, label, Icon }) => (
              <label key={value} className="flex-1 cursor-pointer">
                <input type="radio" value={value} {...register('visibility')} className="sr-only" />
                <div className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                  currentVisibility === value
                    ? 'border-amber-400 bg-amber-50 text-amber-700 font-medium'
                    : 'border-stone-200 text-stone-500 hover:border-stone-300'
                }`}>
                  <Icon size={13} />
                  {label}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" loading={isPending}>
            {isEdit ? 'Save changes' : 'Create wishlist'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
