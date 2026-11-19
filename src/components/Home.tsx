import { ArrowRight, Briefcase, GraduationCap, Home as HomeIcon, Scale, Wrench } from 'lucide-react';
import type { Category } from '@/lib/eu';
import { categoryLabel } from '@/lib/eu';
import { countryName } from '@/lib/countryName';
import type { Lang } from '@/lib/translations';
import { useLang } from '@/lib/LanguageContext';
import { GlassCard } from '@/components/ui';

interface Props {
  onCategory: (c: Category) => void;
  onCountry: (code: string) => void;
  photos: { barcelona: string; paris: string; madrid: string };
}

const COUNTRY_CARDS: { code: string; photo: string; gradient: string }[] = [
  { code: 'ES', photo: 'https://images.pexels.com/photos/19130909/pexels-photo-19130909.jpeg?auto=compress&cs=tinysrgb&w=1200', gradient: 'from-red-900/70' },
  { code: 'FR', photo: 'https://images.pexels.com/photos/30173039/pexels-photo-30173039.jpeg?auto=compress&cs=tinysrgb&w=1200', gradient: 'from-blue-900/70' },
];

export default function Home({ onCategory, onCountry, photos }: Props) {
  const { t, lang } = useLang();

  const cards: { icon: typeof Briefcase; cat: Category }[] = [
    { icon: Briefcase, cat: 'jobs' },
    { icon: HomeIcon, cat: 'housing' },
    { icon: GraduationCap, cat: 'seekers' },
    { icon: Wrench, cat: 'services' },
  ];

  return (
    <div>
      <section
        className="relative overflow-hidden rounded-3xl border border-white/25 shadow-xl"
        style={{ backgroundImage: `url(${photos.barcelona})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="bg-gradient-to-r from-slate-900/70 via-slate-900/45 to-slate-900/25 p-8 sm:p-12">
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-md sm:text-5xl">
            {t.heroTitle}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/95">{t.heroBody}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onCategory('jobs')}
              className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-teal-500"
            >
              {t.ctaJobs} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </button>
            <button
              onClick={() => onCategory('housing')}
              className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/20 px-6 py-3 font-semibold text-white backdrop-blur-sm transition hover:bg-white/35"
            >
              {t.ctaHousing}
            </button>
          </div>
        </div>
      </section>

      <section aria-labelledby="countries-h" className="mt-10">
        <h2 id="countries-h" className="text-2xl font-bold text-white drop-shadow-md">{t.browseByCountry}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {COUNTRY_CARDS.map((c) => (
            <button
              key={c.code}
              onClick={() => onCountry(c.code)}
              className="group relative h-52 overflow-hidden rounded-3xl border border-white/25 bg-cover bg-center text-start shadow-xl transition hover:scale-[1.01] sm:h-64"
              style={{ backgroundImage: `url(${c.photo})` }}
            >
              <span className={`absolute inset-0 bg-gradient-to-t ${c.gradient} via-slate-900/30 to-transparent`} />
              <span className="absolute bottom-0 flex w-full items-end justify-between p-6">
                <span>
                  <span className="block text-2xl font-bold text-white drop-shadow">{countryName(c.code, lang as Lang)}</span>
                  <span className="mt-1 block text-sm text-white/90">
                    {t.browseCountryCta} <ArrowRight className="inline h-4 w-4 rtl:rotate-180" />
                  </span>
                </span>
              </span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-white/80">{t.countryHint}</p>
      </section>

      <section aria-labelledby="about-h" className="mt-10">
        <h2 id="about-h" className="text-2xl font-bold text-white drop-shadow-md">{t.aboutTitle}</h2>
        <p className="mt-2 max-w-2xl text-white/90">{t.aboutBody}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((c) => (
            <button key={c.cat} onClick={() => onCategory(c.cat)} className="text-start">
              <GlassCard className="h-full">
                <c.icon className="h-8 w-8 text-teal-100" />
                <h3 className="mt-3 text-lg font-semibold text-white">{categoryLabel(c.cat, t)}</h3>
                <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-white/90">
                  {{ jobs: t.catJobsDesc, seekers: t.catSeekersDesc, housing: t.catHousingDesc, services: t.catServicesDesc }[c.cat]}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-white">
                  {t.browse} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </span>
              </GlassCard>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <GlassCard>
          <div className="flex items-start gap-3">
            <Scale className="h-8 w-8 shrink-0 text-teal-100" />
            <div>
              <h3 className="text-lg font-semibold text-white">{t.cardLegalTitle}</h3>
              <p className="mt-1 text-sm leading-relaxed text-white/90">{t.cardLegalBody}</p>
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
