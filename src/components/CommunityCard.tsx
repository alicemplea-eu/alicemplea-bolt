import { Facebook, Instagram, Mail, Music2, Users } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { GlassCard } from '@/components/ui';

const LINKS = [
  { label: 'Facebook', handle: '@alicemplea', href: 'https://facebook.com/share/1EAMZSaCDR/', icon: Facebook, bg: 'bg-[#1877f2]' },
  { label: 'Instagram', handle: '@alicemplea', href: 'https://instagram.com/alicemplea', icon: Instagram, bg: 'bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af]' },
  { label: 'TikTok', handle: '@alicemplea', href: 'https://tiktok.com/@alicemplea', icon: Music2, bg: 'bg-black' },
];

export default function CommunityCard() {
  const { t } = useLang();
  return (
    <GlassCard className="mt-10">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-white">
          <Users className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-bold text-white">{t.communityCard}</h3>
          <p className="text-sm text-white/85">{t.communityBody}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {LINKS.map(({ label, handle, href, icon: Icon, bg }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label} ${handle}`}
            className={`inline-flex items-center gap-2 rounded-full ${bg} px-4 py-2 text-sm font-semibold text-white shadow transition hover:opacity-90`}
          >
            <Icon className="h-4 w-4" /> {handle}
          </a>
        ))}
        <a
          href="mailto:alicemplea.eu@gmail.com"
          className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/35"
        >
          <Mail className="h-4 w-4" /> alicemplea.eu@gmail.com
        </a>
      </div>
      <p className="mt-3 text-xs text-white/75">{t.followUs}</p>
    </GlassCard>
  );
}
