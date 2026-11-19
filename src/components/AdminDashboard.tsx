import { useCallback, useEffect, useState } from 'react';
import { BadgeCheck, Eye, EyeOff, Send, Star, Trash2 } from 'lucide-react';
import { supabase, useAuth } from '@/lib/AuthContext';
import type { Listing } from '@/lib/eu';
import { countryName } from '@/lib/countryName';
import type { Lang } from '@/lib/translations';
import { useLang } from '@/lib/LanguageContext';
import { useUi } from '@/lib/UiContext';
import { GlassCard } from '@/components/ui';

const ADMIN_EMAIL = 'alicemplea.eu@gmail.com';

export default function AdminDashboard() {
  const { t, lang } = useLang();
  const { session } = useAuth();
  const { toast } = useUi();
  const [tab, setTab] = useState<'listings' | 'jobs'>('listings');
  const [rows, setRows] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [jTitle, setJTitle] = useState('');
  const [jCountry, setJCountry] = useState('ES');
  const [jCity, setJCity] = useState('');
  const [jDesc, setJDesc] = useState('');
  const [jUrl, setJUrl] = useState('');
  const [busy, setBusy] = useState(false);

  const isAdmin = session?.user.email?.toLowerCase() === ADMIN_EMAIL;

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('admin_list_listings');
    if (!error) setRows((data ?? []) as Listing[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) load();
    else setLoading(false);
  }, [isAdmin, load]);

  const update = async (id: string, patch: { status?: string; featured?: boolean; verified?: boolean }) => {
    const { error } = await supabase.rpc('admin_update_listing', {
      p_id: id,
      p_status: patch.status ?? null,
      p_featured: patch.featured ?? null,
      p_verified: patch.verified ?? null,
    });
    if (error) {
      toast(t.payConfirmError);
    } else {
      toast(t.adminSaved);
      load();
    }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.rpc('admin_delete_listing', { p_id: id });
    if (error) {
      toast(t.payConfirmError);
    } else {
      toast(t.adminSaved);
      load();
    }
  };

  const publishJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.rpc('admin_create_weekly_job', {
      p_title: jTitle,
      p_country: jCountry,
      p_city: jCity,
      p_description: jDesc,
      p_apply_url: jUrl,
    });
    setBusy(false);
    if (error) {
      toast(t.payConfirmError);
    } else {
      toast(t.adminSaved);
      setJTitle('');
      setJCity('');
      setJDesc('');
      setJUrl('');
    }
  };

  if (!isAdmin) return null;

  const inputCls =
    'w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-teal-600';

  const iconBtn = (active: boolean) =>
    `inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
      active ? 'bg-teal-600 text-white' : 'border border-white/50 bg-white/20 text-white hover:bg-white/35'
    }`;

  return (
    <div>
      <div className="mb-6 flex gap-2">
        {(
          [
            ['listings', t.adminTabListings],
            ['jobs', t.adminTabJobs],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              tab === id ? 'bg-white text-gray-900 shadow' : 'border border-white/40 bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'listings' &&
        (loading ? (
          <p className="text-white/90">{t.loadingFeed}</p>
        ) : rows.length === 0 ? (
          <p className="text-white/90">{t.adminEmpty}</p>
        ) : (
          <div className="space-y-3">
            {rows.map((l) => (
              <GlassCard key={l.id}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-white">{l.title}</h3>
                    <p className="text-xs text-white/80">
                      {l.category} · {countryName(l.country_code, lang as Lang)} · {l.city} · {l.status} ·{' '}
                      {l.report_count} ⚑
                    </p>
                  </div>
                  <span className="flex flex-wrap items-center gap-1.5">
                    {l.status === 'active' ? (
                      <button onClick={() => update(l.id, { status: 'hidden' })} className={iconBtn(false)}>
                        <EyeOff className="h-3.5 w-3.5" /> {t.adminHide}
                      </button>
                    ) : (
                      <button onClick={() => update(l.id, { status: 'active' })} className={iconBtn(false)}>
                        <Eye className="h-3.5 w-3.5" /> {t.adminApprove}
                      </button>
                    )}
                    <button onClick={() => update(l.id, { featured: !l.featured })} className={iconBtn(l.featured)}>
                      <Star className="h-3.5 w-3.5" /> {t.featuredBadge}
                    </button>
                    <button onClick={() => update(l.id, { verified: !l.verified })} className={iconBtn(l.verified)}>
                      <BadgeCheck className="h-3.5 w-3.5" /> {t.verifiedBadge}
                    </button>
                    <button
                      onClick={() => remove(l.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-red-300/60 bg-red-900/40 px-3 py-1.5 text-xs font-semibold text-red-50 transition hover:bg-red-800/60"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> {t.deleteListing}
                    </button>
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>
        ))}

      {tab === 'jobs' && (
        <GlassCard>
          <h3 className="font-bold text-white">{t.adminJobForm}</h3>
          <form onSubmit={publishJob} className="mt-3 space-y-3">
            <input required value={jTitle} onChange={(e) => setJTitle(e.target.value)} placeholder={t.listingTitle} className={inputCls} />
            <div className="grid gap-3 sm:grid-cols-2">
              <select value={jCountry} onChange={(e) => setJCountry(e.target.value)} className={inputCls}>
                <option value="ES">🇪🇸 {countryName('ES', lang as Lang)}</option>
                <option value="FR">🇫🇷 {countryName('FR', lang as Lang)}</option>
              </select>
              <input required value={jCity} onChange={(e) => setJCity(e.target.value)} placeholder={t.city} className={inputCls} />
            </div>
            <textarea required value={jDesc} onChange={(e) => setJDesc(e.target.value)} placeholder={t.description} rows={4} className={inputCls} />
            <input value={jUrl} onChange={(e) => setJUrl(e.target.value)} placeholder={t.apply + ' (URL)'} className={inputCls} />
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-6 py-2.5 font-semibold text-white transition hover:bg-teal-500 disabled:opacity-60"
            >
              <Send className="h-4 w-4" /> {busy ? t.publishing : t.publish}
            </button>
          </form>
        </GlassCard>
      )}
    </div>
  );
}
