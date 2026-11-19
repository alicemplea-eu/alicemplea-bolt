import { ExternalLink, MapPin, Wallet, Languages, Building2, Zap } from 'lucide-react';
import type { LiveJob } from '@/lib/eu';
import { countryInfo } from '@/components/ListingCard';
import { useLang } from '@/lib/LanguageContext';
import { GlassCard } from '@/components/ui';

interface Props {
  job: LiveJob;
  onUpgrade: () => void;
}

export default function LiveJobCard({ job }: Props) {
  const { t } = useLang();
  const country = countryInfo(LIVE(job.country));

  return (
    <GlassCard className="border-dashed">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-lg font-semibold text-white">{job.title}</h3>
          <p className="text-sm text-white/80">{job.company}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sky-500/90 px-2 py-0.5 text-[11px] font-bold text-white">
          <Zap className="h-3 w-3" /> {t.liveJobsBadge}
        </span>
      </div>
      <div className="mt-4 space-y-1.5 text-sm text-white/90">
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0" /> {country?.flag ?? '🇪🇺'} {job.city}
        </p>
        {job.jobType && (
          <p className="flex items-center gap-2">
            <Building2 className="h-4 w-4 shrink-0" /> {job.jobType}
          </p>
        )}
        {job.salaryText && (
          <p className="flex items-center gap-2">
            <Wallet className="h-4 w-4 shrink-0" /> {job.salaryText}
          </p>
        )}
        {job.languages && (
          <p className="flex items-center gap-2">
            <Languages className="h-4 w-4 shrink-0" /> {job.languages}
          </p>
        )}
      </div>
      {job.description && <p className="mt-3 line-clamp-2 text-xs text-white/75">{job.description}</p>}
      <a
        href={job.applyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-white/50 bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500"
      >
        {t.apply} <ExternalLink className="h-4 w-4" />
      </a>
    </GlassCard>
  );
}

function LIVE(countryName: string): string {
  const map: Record<string, string> = {
    Germany: 'DE', France: 'FR', Spain: 'ES', Italy: 'IT', Netherlands: 'NL', Belgium: 'BE',
    Austria: 'AT', Poland: 'PL', Sweden: 'SE', Denmark: 'DK', Finland: 'FI', Ireland: 'IE',
    Portugal: 'PT', Greece: 'GR', Czechia: 'CZ', Romania: 'RO', Hungary: 'HU',
  };
  return map[countryName] ?? 'DE';
}
