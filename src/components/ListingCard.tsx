import { useState } from 'react';
import { AlertTriangle, BadgeCheck, Lock, Mail, MapPin, Phone, Star, Trash2 } from 'lucide-react';
import { supabase, useAuth } from '@/lib/AuthContext';
import { EU_COUNTRIES } from '@/lib/eu';
import type { Listing } from '@/lib/eu';
import { useLang } from '@/lib/LanguageContext';
import { useUi } from '@/lib/UiContext';
import { GlassCard } from '@/components/ui';

export function countryInfo(code: string) {
  return EU_COUNTRIES.find((c) => c.code === code);
}

export function Badges({ listing }: { listing: Listing }) {
  const { t } = useLang();
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {listing.featured && (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-bold text-amber-950">
          <Star className="h-3 w-3" /> {t.featuredBadge}
        </span>
      )}
      {listing.verified && (
        <span className="inline-flex items-center gap-1 rounded-full bg-teal-600 px-2 py-0.5 text-[11px] font-bold text-white">
          <BadgeCheck className="h-3 w-3" /> {t.verifiedBadge}
        </span>
      )}
    </span>
  );
}

interface Props {
  listing: Listing;
  onDelete?: (id: string) => void;
}

export default function ListingCard({ listing, onDelete }: Props) {
  const { t } = useLang();
  const { session } = useAuth();
  const { openAuth, toast } = useUi();
  const [revealed, setRevealed] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState('');

  const country = countryInfo(listing.country_code);
  const isOwner = session?.user.id === listing.user_id;

  const revealContact = () => {
    if (!session) {
      openAuth();
      return;
    }
    setRevealed(true);
  };

  const submitReport = async () => {
    const { error } = await supabase.from('listing_reports').insert({
      listing_id: listing.id,
      reason: reason.trim() || null,
    });
    if (error) {
      toast(t.reportError);
    } else {
      toast(t.reportSent);
    }
    setReporting(false);
    setReason('');
  };

  const deleteListing = async () => {
    const { error } = await supabase.from('listings').delete().eq('id', listing.id);
    if (!error) {
      toast(t.myListing + ' — ' + t.deleteListing);
      onDelete?.(listing.id);
    }
  };

  return (
    <GlassCard className={listing.featured ? 'ring-2 ring-amber-300/70' : ''}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-white">{listing.title}</h3>
          <p className="text-sm text-white/80">
            {country?.flag} {listing.city}, {country?.name}
          </p>
        </div>
        <Badges listing={listing} />
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/90">{listing.description}</p>

      {listing.price_text && (
        <p className="mt-3 rounded-lg border border-white/25 bg-white/15 px-3 py-1.5 text-sm font-semibold text-white">
          {listing.price_text}
        </p>
      )}

      {revealed && (
        <div className="mt-3 space-y-1 rounded-xl border border-teal-200/40 bg-teal-900/30 p-3 text-sm text-white">
          {listing.contact_email && (
            <p className="flex items-center gap-2 break-all">
              <Mail className="h-4 w-4 shrink-0" /> {listing.contact_email}
            </p>
          )}
          {listing.contact_phone && (
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" /> {listing.contact_phone}
            </p>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!revealed && (listing.contact_email || listing.contact_phone) ? (
          <button
            onClick={revealContact}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/50 bg-white/25 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-white hover:text-gray-900"
          >
            <Lock className="h-4 w-4" /> {session ? t.showContact : t.signInToContact}
          </button>
        ) : null}
        {isOwner && onDelete ? (
          <button
            onClick={deleteListing}
            className="inline-flex items-center gap-1.5 rounded-full border border-red-300/60 bg-red-900/40 px-4 py-1.5 text-sm font-semibold text-red-50 transition hover:bg-red-800/60"
          >
            <Trash2 className="h-4 w-4" /> {t.deleteListing}
          </button>
        ) : null}
        <button
          onClick={() => setReporting((v) => !v)}
          className="ms-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/20 hover:text-white"
        >
          <AlertTriangle className="h-4 w-4" /> {t.report}
        </button>
      </div>

      {reporting && (
        <div className="mt-3 rounded-xl border border-amber-300/50 bg-amber-900/30 p-3">
          <p className="text-xs text-amber-50">{t.reportBody}</p>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t.reportReason}
            className="mt-2 w-full rounded-lg border border-white/30 bg-white/20 px-3 py-1.5 text-sm text-white placeholder-white/60 outline-none focus:border-white/60"
          />
          <button
            onClick={submitReport}
            className="mt-2 w-full rounded-full bg-amber-500 px-4 py-1.5 text-sm font-bold text-amber-950 transition hover:bg-amber-400"
          >
            {t.reportSubmit}
          </button>
        </div>
      )}

      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-white/70">
        <MapPin className="h-3 w-3" /> {t.archiveNote}
      </p>
    </GlassCard>
  );
}
