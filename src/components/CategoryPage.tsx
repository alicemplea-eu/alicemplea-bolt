import { useCallback, useEffect, useMemo, useState } from 'react';
import { Compass, FileUp, LayoutGrid, List, Navigation, Plus } from 'lucide-react';
import { supabase, useAuth } from '@/lib/AuthContext';
import { CITY_OPTIONS, TARGET_COUNTRIES } from '@/lib/eu';
import type { Category, Listing, LiveJob } from '@/lib/eu';
import { categoryLabel } from '@/lib/eu';
import { countryName } from '@/lib/countryName';
import type { Lang } from '@/lib/translations';
import { useLang } from '@/lib/LanguageContext';
import { useUi } from '@/lib/UiContext';
import { SectionHeader } from '@/components/ui';
import ListingCard from '@/components/ListingCard';
import ListingMap from '@/components/ListingMap';
import PostModal from '@/components/PostModal';
import LiveJobCard from '@/components/LiveJobCard';
import CommunityCard from '@/components/CommunityCard';

const LIVE_COUNTRY: Record<string, string> = {
  Germany: 'DE', France: 'FR', Spain: 'ES', Italy: 'IT', Netherlands: 'NL', Belgium: 'BE',
  Austria: 'AT', Poland: 'PL', Sweden: 'SE', Denmark: 'DK', Finland: 'FI', Ireland: 'IE',
  Portugal: 'PT', Greece: 'GR', Czechia: 'CZ', Romania: 'RO', Hungary: 'HU',
};

function haversineKm(a: [number, number], b: [number, number]) {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

interface Props {
  category: Category;
  description: string;
  initialCountry?: string;
}

export default function CategoryPage({ category, description, initialCountry = 'ALL' }: Props) {
  const { t, lang } = useLang();
  const { session } = useAuth();
  const { openAuth, openUpgrade, toast } = useUi();

  const [listings, setListings] = useState<Listing[]>([]);
  const [liveJobs, setLiveJobs] = useState<LiveJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [countryFilter, setCountryFilter] = useState<string>(initialCountry);
  const [cityFilter, setCityFilter] = useState<string>('ALL');
  const [view, setView] = useState<'list' | 'map'>('list');
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState(false);
  const [postOpen, setPostOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('category', category)
      .eq('status', 'active')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });
    if (!error) setListings((data ?? []) as Listing[]);
    setLoading(false);
  }, [category]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (category !== 'jobs') return;
    (async () => {
      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/live-jobs`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        });
        if (!res.ok) throw new Error(String(res.status));
        const body = await res.json();
        if (Array.isArray(body?.jobs)) setLiveJobs(body.jobs);
      } catch {
        // feed is optional enhancement; community listings still render
      }
    })();
  }, [category]);

  const requestNearMe = () => {
    if (userPos) {
      setUserPos(null);
      setLocError(false);
      return;
    }
    if (!('geolocation' in navigator)) {
      setLocError(true);
      return;
    }
    setLocating(true);
    setLocError(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      () => {
        setLocating(false);
        setLocError(true);
      },
      { timeout: 10000 }
    );
  };

  const filtered = useMemo(() => {
    let out = listings.filter((l) => countryFilter === 'ALL' || l.country_code === countryFilter);
    if (cityFilter !== 'ALL') out = out.filter((l) => l.city.toLowerCase().includes(cityFilter.toLowerCase()));
    if (userPos) {
      out = out
        .map((l) => ({
          l,
          d:
            l.latitude != null && l.longitude != null
              ? haversineKm(userPos, [l.latitude, l.longitude])
              : Number.POSITIVE_INFINITY,
        }))
        .sort((a, b) => a.d - b.d)
        .filter((x) => x.d <= 300)
        .map((x) => x.l);
    }
    return out;
  }, [listings, countryFilter, cityFilter, userPos]);

  const filteredLive = useMemo(() => {
    let out = liveJobs;
    if (countryFilter !== 'ALL') out = out.filter((j) => LIVE_COUNTRY[j.country] === countryFilter);
    if (cityFilter !== 'ALL') out = out.filter((j) => j.city.toLowerCase().includes(cityFilter.toLowerCase()));
    if (userPos) {
      out = out
        .map((j) => ({
          j,
          d:
            j.latitude != null && j.longitude != null
              ? haversineKm(userPos, [j.latitude, j.longitude])
              : Number.POSITIVE_INFINITY,
        }))
        .sort((a, b) => a.d - b.d)
        .filter((x) => x.d <= 500)
        .map((x) => x.j);
    }
    return out;
  }, [liveJobs, countryFilter, cityFilter, userPos]);

  const total = filtered.length + filteredLive.length;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionHeader title={categoryLabel(category, t)} subtitle={description} />
        <button
          onClick={() => (session ? setPostOpen(true) : openAuth())}
          className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-5 py-2.5 font-semibold text-white shadow-lg transition hover:bg-teal-500"
        >
          {session ? <Plus className="h-4 w-4" /> : <FileUp className="h-4 w-4" />}
          {session ? t.postListing : t.signInToPost}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={countryFilter}
          onChange={(e) => {
            setCountryFilter(e.target.value);
            setCityFilter('ALL');
          }}
          className="rounded-full border border-white/40 bg-slate-900/60 px-4 py-2 text-sm font-medium text-white outline-none backdrop-blur-sm"
        >
          <option value="ALL">{t.filterAll}</option>
          {TARGET_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {countryName(c.code, lang as Lang)}
            </option>
          ))}
        </select>
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          aria-label="City"
          className="rounded-full border border-white/40 bg-slate-900/60 px-4 py-2 text-sm font-medium text-white outline-none backdrop-blur-sm"
        >
          <option value="ALL">{t.allCities}</option>
          {(cityFilter === 'ALL' ? ['ES', 'FR'] : [countryFilter]).flatMap((cc) =>
            (CITY_OPTIONS[cc] ?? []).map((city) => (
              <option key={`${cc}-${city}`} value={city}>
                {city}
              </option>
            ))
          )}
        </select>
        <button
          onClick={requestNearMe}
          className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition ${
            userPos
              ? 'border-blue-300 bg-blue-600 text-white'
              : 'border-white/40 bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          <Navigation className="h-4 w-4" />
          {locating ? t.locating : t.nearMe}
        </button>
        <div className="ms-auto flex rounded-full border border-white/40 bg-slate-900/60 p-0.5 backdrop-blur-sm">
          {(['list', 'map'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                view === v ? 'bg-white text-gray-900' : 'text-white'
              }`}
            >
              {v === 'list' ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
              {v === 'list' ? t.listView : t.mapView}
            </button>
          ))}
        </div>
      </div>

      {(userPos || locError) && (
        <p className={`mt-2 flex items-center gap-1.5 text-sm ${locError ? 'text-amber-200' : 'text-teal-100'}`}>
          <Compass className="h-4 w-4" />
          {locError ? t.locationError : t.nearMeOn}
        </p>
      )}

      <p className="mt-3 text-sm text-white/80">{total} {t.results}</p>

      {view === 'map' ? (
        <div className="mt-4">
          <ListingMap
            listings={filtered}
            userPos={userPos}
          />
        </div>
      ) : loading ? (
        <p className="mt-6 text-white/90">{t.loadingFeed}</p>
      ) : (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((l) => (
              <ListingCard key={l.id} listing={l} onDelete={load} />
            ))}
            {category === 'jobs' &&
              filteredLive.map((j) => <LiveJobCard key={j.id} job={j} onUpgrade={() => openUpgrade()} />)}
          </div>
          {total === 0 && <p className="mt-6 text-white/90">{t.noResults}</p>}
          {listings.length > 0 && category === 'jobs' && filteredLive.length > 0 && (
            <p className="mt-4 flex items-center gap-1.5 text-sm text-teal-100">
              <LayoutGrid className="h-4 w-4" /> {filteredLive.length} · {t.liveJobsBadge}
            </p>
          )}
        </>
      )}

      {postOpen && session && (
        <PostModal
          category={category}
          onClose={() => setPostOpen(false)}
          onPosted={() => {
            load();
            toast(t.postedSuccessfully);
          }}
        />
      )}
      <CommunityCard />
    </div>
  );
}
