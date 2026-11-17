interface TelegramButtonProps {
  username?: string | null;
  className?: string;
  size?: 'sm' | 'md';
  label?: string;
}

export function TelegramIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
    </svg>
  );
}

export function TelegramButton({
  username,
  className = '',
  size = 'sm',
  label,
}: TelegramButtonProps) {
  if (!username) return null;

  // Clean and normalize
  const cleanUsername = username.trim().replace(/^@/, '').replace(/^https?:\/\/t\.me\//i, '').replace(/\/$/, '');
  if (!cleanUsername) return null;

  const url = `https://t.me/${cleanUsername}`;
  const displayText = label || `@${cleanUsername}`;

  const isSmall = size === 'sm';

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center gap-1.5 font-medium transition-all duration-200 rounded-full select-none ${
        isSmall
          ? 'px-2.5 py-1 text-xs bg-[#229ED9]/10 text-[#0088cc] hover:bg-[#229ED9]/20 hover:text-[#0077b5] border border-[#229ED9]/20 shadow-xs'
          : 'px-3.5 py-1.5 text-sm bg-[#0088cc] text-white hover:bg-[#0077b5] shadow-sm hover:shadow-md'
      } ${className}`}
      title={`Contact @${cleanUsername} on Telegram`}
      aria-label={`Contact @${cleanUsername} on Telegram`}
    >
      <TelegramIcon size={isSmall ? 14 : 16} />
      <span>{displayText}</span>
    </a>
  );
}
