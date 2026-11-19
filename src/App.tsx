import { useEffect, useState } from 'react';
import { Briefcase, Globe, Home as HomeIcon, Scale, Search, Store, User, Sparkles, ShieldCheck } from 'lucide-react';
import { CATEGORIES } from '@/lib/eu';
import type { Category } from '@/lib/eu';
import { categoryLabel } from '@/lib/eu';
import { LANGS } from '@/lib/translations';
import { LanguageProvider, useLang } from '@/lib/LanguageContext';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { UiProvider, useUi } from '@/lib/UiContext';
import { GlassModal } from '@/components/ui';
import Home from '@/components/Home';
import CategoryPage from '@/components/CategoryPage';
import Legal from '@/components/Legal';
import AdminDashboard from '@/components/AdminDashboard';
import AuthModal from '@/components/AuthModal';
import AiDrawer from '@/components/AiDrawer';

const PHOTOS = {
  main: 'https://images.pexels.com/photos/17501700/pexels-photo-17501700.jpeg?auto=compress&cs=tinysrgb&w=1920',
  barcelona: 'https://images.pexels.com/photos/8910324/pexels-photo-8910324.jpeg?auto=compress&cs=tinysrgb&w=1600',
  paris: 'https://images.pexels.com/photos/30173039/pexels-photo-30173039.jpeg?auto=compress&cs=tinysrgb&w=1200',
  madrid: 'https://images.pexels.com/photos/19130909/pexels-photo-19130909.jpeg?auto=compress&cs=tinysrgb&w=1200',
};

const NAV_ICONS: Record<Category, typeof Briefcase> = {
  jobs: Briefcase,
  seekers: Search,
  housing: Store,
  services: Sparkles,
};

type Section = 'home' | 'category' | 'legal';

const ADMIN_EMAIL = 'alicemplea.eu@gmail.com';

const TICKER_TEXT =
  '✨ أعلن عن محلك أو مكتبك القانوني في مقدمة دليل إسبانيا وفرنسا مقابل 15€ شهرياً فقط — تواصل معنا عبر alicemplea.eu@gmail.com | Anuncia tu negocio aquí por solo 15€/mes ✨';

function Ticker() {
  return (
    <div className="overflow-hidden border-b border-white/20 bg-teal-950/85 backdrop-blur-md" aria-hidden>
      <div className="ticker-track py-1.5 text-xs font-semibold text-amber-200">
        <span className="px-6">{TICKER_TEXT}</span>
        <span className="px-6">{TICKER_TEXT}</span>
      </div>
    </div>
  );
}

function Shell() {
  const { t, lang, setLang } = useLang();
  const { session } = useAuth();
  const { openAuth } = useUi();
  const [section, setSection] = useState<Section>('home');
  const isAdmin = session?.user.email?.toLowerCase() === ADMIN_EMAIL;
  const [subCategory, setSubCategory] = useState<Category>('jobs');
  const [countryFilter, setCountryFilter] = useState<string>('ALL');
  const [countryKey, setCountryKey] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem('alicemplea.welcomed')) setShowWelcome(true);
    } catch {
      setShowWelcome(true);
    }
  }, []);

  const dismissWelcome = () => {
    setShowWelcome(false);
    try {
      localStorage.setItem('alicemplea.welcomed', '1');
    } catch {
      // storage unavailable
    }
  };

  const goCategory = (cat: Category, country?: string) => {
    setSubCategory(cat);
    if (country !== undefined) {
      setCountryFilter(country);
      setCountryKey((k) => k + 1);
    }
    setSection('category');
  };

  const userLabel = session?.user.email ?? '';

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <div aria-hidden className="eu-bg" style={{ ['--eu-bg-photo' as string]: `url(${PHOTOS.main})` }} />
      <div aria-hidden className="eu-bg-veil" />

      <Ticker />

      <header className="sticky top-0 z-40 border-b border-white/20 bg-slate-900/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <button onClick={() => setSection('home')} className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 font-bold text-white shadow">A</span>
            <span className="text-xl font-bold tracking-tight text-white drop-shadow">Alicemplea</span>
          </button>

          <nav className="hidden items-center gap-1 lg:flex">
            <button
              onClick={() => setSection('home')}
              className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition ${
                section === 'home' ? 'bg-white text-gray-900 shadow' : 'text-white hover:bg-white/20'
              }`}
            >
              <HomeIcon className="h-4 w-4" /> {t.nav.home}
            </button>
            {CATEGORIES.map((cat) => {
              const Icon = NAV_ICONS[cat];
              const active = section === 'category' && subCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => goCategory(cat)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition ${
                    active ? 'bg-white text-gray-900 shadow' : 'text-white hover:bg-white/20'
                  }`}
                >
                  <Icon className="h-4 w-4" /> {categoryLabel(cat, t)}
                </button>
              );
            })}
            <button
              onClick={() => setSection('legal')}
              className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition ${
                section === 'legal' ? 'bg-white text-gray-900 shadow' : 'text-white hover:bg-white/20'
              }`}
            >
              <Scale className="h-4 w-4" /> {t.nav.legal}
            </button>
            {isAdmin && (
              <button
                onClick={() => setAdminOpen(true)}
                className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20"
              >
                <ShieldCheck className="h-4 w-4" /> Admin
              </button>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAiOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-500 to-teal-500 px-4 py-1.5 text-sm font-semibold text-white shadow transition hover:opacity-90"
            >
              <Sparkles className="h-4 w-4" /> <span className="hidden sm:inline">{t.aiHubTitle}</span>
            </button>
            <Globe className="h-4 w-4 shrink-0 text-white/90" />
            <select
              aria-label="Language"
              value={lang}
              onChange={(e) => setLang(e.target.value as typeof lang)}
              className="shrink-0 rounded-full border border-white/40 bg-slate-900/60 px-2 py-1.5 text-xs font-medium text-white outline-none backdrop-blur-sm sm:px-3 sm:text-sm"
            >
              {LANGS.map((l) => (
                <option key={l.code} value={l.code} className="text-gray-900">
                  {l.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => (session ? setUserMenuOpen(true) : openAuth())}
              aria-label={userLabel || t.signIn}
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                session ? 'border-teal-300 bg-teal-600/80 text-white' : 'border-white/40 bg-white/20 text-white hover:bg-white/35'
              }`}
            >
              <User className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 lg:pb-16">
        {section === 'home' && (
          <Home onCategory={(c) => goCategory(c)} onCountry={(code) => goCategory('jobs', code)} photos={PHOTOS} />
        )}
        {section === 'category' && (
          <CategoryPage
            key={`${subCategory}-${countryKey}`}
            category={subCategory}
            description={catDescription(subCategory, t)}
            initialCountry={countryFilter}
          />
        )}
        {section === 'legal' && (
          <div>
            <Legal />
          </div>
        )}

        <footer className="mt-12 border-t border-white/25 pt-6 text-center text-sm text-white/85">
          <p className="font-semibold text-white">Alicemplea</p>
          <p className="mt-1">{t.builtFor}</p>
          <button onClick={() => setSection('legal')} className="mt-1 underline hover:text-white">
            {t.nav.legal}
          </button>
          <p className="mt-1">© 2026 Alicemplea Team. {t.rightsReserved}</p>
          <p className="mt-1 text-xs text-white/70">{t.operatedBy}</p>
        </footer>
      </main>

      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 border-t border-white/25 bg-slate-900/90 backdrop-blur-lg lg:hidden">
        <div className="flex items-stretch justify-around px-0.5 pb-[env(safe-area-inset-bottom)]">
          <button
            onClick={() => setSection('home')}
            aria-current={section === 'home' ? 'page' : undefined}
            className="flex min-w-0 flex-1 flex-col items-center gap-0.5 px-0.5 py-1.5 text-[10px] font-medium leading-tight"
          >
            <span className={`flex h-7 w-7 items-center justify-center rounded-full ${section === 'home' ? 'bg-teal-600 text-white shadow' : 'text-white/70'}`}>
              <HomeIcon className="h-4 w-4" />
            </span>
            <span className="w-full truncate text-center">{t.navShort.home}</span>
          </button>
          {(['jobs', 'seekers', 'housing'] as const).map((cat) => {
            const Icon = NAV_ICONS[cat];
            const active = section === 'category' && subCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => goCategory(cat)}
                aria-current={active ? 'page' : undefined}
                className="flex min-w-0 flex-1 flex-col items-center gap-0.5 px-0.5 py-1.5 text-[10px] font-medium leading-tight"
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-full ${active ? 'bg-teal-600 text-white shadow' : 'text-white/70'}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="w-full truncate text-center">{t.navShort[cat]}</span>
              </button>
            );
          })}
          <button
            onClick={() => setSection('legal')}
            aria-current={section === 'legal' ? 'page' : undefined}
            className="flex min-w-0 flex-1 flex-col items-center gap-0.5 px-0.5 py-1.5 text-[10px] font-medium leading-tight"
          >
            <span className={`flex h-7 w-7 items-center justify-center rounded-full ${section === 'legal' ? 'bg-teal-600 text-white shadow' : 'text-white/70'}`}>
              <Scale className="h-4 w-4" />
            </span>
            <span className="w-full truncate text-center">{t.navShort.legal}</span>
          </button>
        </div>
      </nav>

      <AiDrawer open={aiOpen} onClose={() => setAiOpen(false)} />

      {adminOpen && isAdmin && (
        <GlassModal title={t.adminTitle} onClose={() => setAdminOpen(false)} wide labelledBy="admin-title">
          <AdminDashboard />
        </GlassModal>
      )}

      {showWelcome && (
        <GlassModal title={t.welcomeTitle} onClose={dismissWelcome} labelledBy="welcome-title">
          <div id="welcome-title">
            <p className="font-medium text-teal-800">{t.tagline}</p>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">{t.welcomeBody}</p>
            <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3">
              <p className="font-semibold text-amber-900">{t.disclaimerTitle}</p>
              <p className="mt-1 text-sm leading-relaxed text-amber-900/90">{t.disclaimerBody}</p>
            </div>
            <button
              onClick={dismissWelcome}
              className="mt-5 w-full rounded-full bg-teal-600 px-6 py-3 font-semibold text-white shadow transition hover:bg-teal-500"
            >
              {t.accept}
            </button>
          </div>
        </GlassModal>
      )}

      {userMenuOpen && session && <AuthModal onClose={() => setUserMenuOpen(false)} />}
    </div>
  );
}

function catDescription(cat: Category, t: ReturnType<typeof useLang>['t']): string {
  return { jobs: t.catJobsDesc, seekers: t.catSeekersDesc, housing: t.catHousingDesc, services: t.catServicesDesc }[cat];
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <UiProvider>
          <Shell />
        </UiProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
