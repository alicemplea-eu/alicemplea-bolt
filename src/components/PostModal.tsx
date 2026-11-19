import { useState } from 'react';
import { supabase } from '@/lib/AuthContext';
import { CITY_OPTIONS, TARGET_COUNTRIES } from '@/lib/eu';
import type { Category } from '@/lib/eu';
import { useLang } from '@/lib/LanguageContext';
import { useUi } from '@/lib/UiContext';
import { GlassModal } from '@/components/ui';

const CITY_COORDS: Record<string, [number, number]> = {
  ES: [40.2, -3.7], FR: [46.6, 2.35], DE: [51.16, 10.45], IT: [42.8, 12.5], NL: [52.13, 5.29],
  BE: [50.5, 4.47], PT: [39.4, -8.22], AT: [47.52, 14.55], IE: [53.14, -7.69], PL: [51.92, 19.15],
};

interface Props {
  category: Category;
  onClose: () => void;
  onPosted: () => void;
}

export default function PostModal({ category, onClose, onPosted }: Props) {
  const { t } = useLang();
  const { toast } = useUi();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [country, setCountry] = useState('ES');
  const [city, setCity] = useState('');
  const [price, setPrice] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [details, setDetails] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) {
      setError(t.mustAcceptDisclaimer);
      return;
    }
    setError(null);
    setBusy(true);
    const fallback = CITY_COORDS[country] ?? [50.11, 8.68];
    const { error: err } = await supabase.from('listings').insert({
      category,
      title: title.trim(),
      description: description.trim() + (details.trim() ? `\n\n${details.trim()}` : ''),
      country_code: country,
      city: city.trim() || TARGET_COUNTRIES.find((c) => c.code === country)?.name || '',
      latitude: fallback[0] + (Math.random() - 0.5) * 2,
      longitude: fallback[1] + (Math.random() - 0.5) * 2,
      price_text: price.trim() || null,
      contact_email: email.trim() || null,
      contact_phone: phone.trim() || null,
      details: {},
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    toast(t.postedSuccessfully);
    onPosted();
    onClose();
  };

  const inputCls =
    'w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-teal-600';

  return (
    <GlassModal title={t.postListing} onClose={onClose} labelledBy="post-title">
      <form onSubmit={submit} className="space-y-3" id="post-title">
        <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.listingTitle} className={inputCls} />
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t.description}
          rows={4}
          className={inputCls}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <select value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls}>
            {TARGET_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
          <select value={city} onChange={(e) => setCity(e.target.value)} className={inputCls}>
            <option value="">{t.allCities}</option>
            {(CITY_OPTIONS[country] ?? []).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder={t.pricePlaceholder} className={inputCls} />
        <div className="grid gap-3 sm:grid-cols-2">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.contactEmail} className={inputCls} />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t.contactPhone} className={inputCls} />
        </div>
        <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder={t.extraDetails} rows={2} className={inputCls} />
        <label className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-amber-600"
          />
          {t.disclaimerCheckbox}
        </label>
        {error && <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800">{error}</p>}
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-full border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-100">
            {t.cancel}
          </button>
          <button type="submit" disabled={busy} className="flex-1 rounded-full bg-teal-600 px-6 py-3 font-semibold text-white transition hover:bg-teal-500 disabled:opacity-60">
            {busy ? t.publishing : t.publish}
          </button>
        </div>
      </form>
    </GlassModal>
  );
}
