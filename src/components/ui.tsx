import { X } from 'lucide-react';

export function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8 max-w-2xl">
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white drop-shadow-md">{title}</h2>
      <p className="mt-2 text-white/85">{subtitle}</p>
    </div>
  );
}

export function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/25 bg-white/20 p-5 shadow-lg backdrop-blur-md transition-colors duration-200 hover:bg-white/25 ${className}`}
    >
      {children}
    </div>
  );
}

export function GlassModal({
  title,
  onClose,
  children,
  labelledBy,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  labelledBy?: string;
  wide?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      onClick={onClose}
    >
      <div
        className={`relative w-full rounded-3xl border border-white/30 bg-white/90 p-6 text-gray-900 shadow-2xl backdrop-blur-xl sm:p-8 max-h-[85vh] overflow-y-auto ${
          wide ? 'max-w-3xl' : 'max-w-lg'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 end-4 rounded-full p-1.5 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 id={labelledBy} className="pe-8 text-xl font-bold sm:text-2xl">
          {title}
        </h2>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}
