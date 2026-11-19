import { Mail, ShieldCheck } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { GlassCard, SectionHeader } from '@/components/ui';

export default function Legal() {
  const { t } = useLang();

  const notices = [
    { title: t.legalJobsTitle, body: t.legalJobsBody },
    { title: t.legalDsaTitle, body: t.legalDsaBody },
    { title: t.legalLssiTitle, body: t.legalLssiBody },
    { title: t.legalGdprTitle, body: t.legalGdprBody },
    { title: t.legalTermsTitle, body: t.legalTermsBody },
  ];

  return (
    <div>
      <SectionHeader title={t.sectionLegal} subtitle={t.builtFor} />
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-teal-200/40 bg-teal-900/30 p-4 backdrop-blur-md">
        <ShieldCheck className="h-8 w-8 shrink-0 text-teal-200" />
        <p className="text-sm text-white/90">
          {t.legalUpdated}: 2026-11-16 · Regulation (EU) 2022/2065 (DSA) · Ley 34/2002 (LSSI-CE) · Regulation (EU) 2016/679 (GDPR)
        </p>
      </div>
      <div className="space-y-4">
        {notices.map((n) => (
          <GlassCard key={n.title}>
            <h3 className="text-lg font-semibold text-white">{n.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/90">{n.body}</p>
          </GlassCard>
        ))}
        <GlassCard>
          <h3 className="text-lg font-semibold text-white">{t.contactTitle}</h3>
          <p className="mt-2 text-sm text-white/90">{t.contactBody}</p>
          <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-white">
            <Mail className="h-4 w-4" /> legal@alicemplea.eu · moderation@alicemplea.eu · privacy@alicemplea.eu
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
