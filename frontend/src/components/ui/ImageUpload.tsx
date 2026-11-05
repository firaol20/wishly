import { useRef, useState } from 'react';
import { Upload, X, Image } from 'lucide-react';
import { cn } from '../../utils/cn';
import { uploadApi } from '../../services/api';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onClear?: () => void;
  className?: string;
  label?: string;
}

export function ImageUpload({ value, onChange, onClear, className, label }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB');
      return;
    }

    setError('');
    setUploading(true);
    setProgress(0);

    // Simulate progress for UX
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 15, 85));
    }, 200);

    try {
      const { data } = await uploadApi.upload(file);
      setProgress(100);
      onChange(data.url);
    } catch {
      // If upload API not configured, use local object URL as fallback
      const localUrl = URL.createObjectURL(file);
      onChange(localUrl);
      setProgress(100);
    } finally {
      clearInterval(interval);
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && <span className="text-sm font-medium text-stone-700">{label}</span>}

      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-stone-200">
          <img src={value} alt="Upload preview" className="w-full h-40 object-cover" />
          <button
            type="button"
            onClick={() => { onChange(''); onClear?.(); }}
            className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
            aria-label="Remove image"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-stone-200 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-all"
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
          aria-label="Upload image"
        >
          {uploading ? (
            <>
              <Upload size={24} className="text-amber-400 animate-bounce" />
              <div className="w-full bg-stone-100 rounded-full h-1.5">
                <div
                  className="bg-amber-400 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-stone-400">Uploading... {progress}%</span>
            </>
          ) : (
            <>
              <Image size={24} className="text-stone-300" />
              <span className="text-sm text-stone-400">Drop an image here, or click to browse</span>
              <span className="text-xs text-stone-300">JPEG, PNG, WebP — max 5MB</span>
            </>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}
