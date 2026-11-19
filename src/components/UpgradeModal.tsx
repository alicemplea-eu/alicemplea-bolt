import { useState } from 'react';
import { BadgeCheck, Check, Copy, ExternalLink, ShieldCheck, Star, Wallet } from 'lucide-react';
import { supabase } from '@/lib/AuthContext';
import { useLang } from '@/lib/LanguageContext';
import { useUi } from '@/lib/UiContext';
import { GlassModal } from '@/components/ui';

const PAYPAL_URL = 'https://paypal.me';

const WALLETS = [
  { label: 'Binance (TRC20)', address: 'TJEK2s6ouhMUb6K2aDMPuUc8iFnCWxz1fn' },
  { label: 'Bybit (TRC20)', address: 'TAtcNRDF3cStVtNZTk2qw1KeMxdMaiH39U' },
  { label: 'RedotPay (TRC20)', address: 'TCWBKspfhHMjA5BDMqiXsm3VjEhEwhmDrJ' },
];

const PAYMENT_METHODS = ['PayPal', ...WALLETS.map((w) => w.label)];

function WalletRow({ label, address }: { label: string; address: string }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      const el = document.createElement('textarea');
      el.value = address;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate font-mono text-xs text-gray-900">{address}</code>
        <button
          onClick={copy}
          aria-label={`${t.payCopy} ${label}`}
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            copied ? 'bg-teal-600 text-white' : 'bg-gray-900 text-white hover:bg-gray-700'
          }`}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? t.payCopied : t.payCopy}
        </button>
      </div>
    </div>
  );
}

export default function UpgradeModal({ onClose }: { onClose: () => void }) {
  const { t } = useLang();
  const { toast } = useUi();
  const [listingTitle, setListingTitle] = useState('');
  const [method, setMethod] = useState(PAYMENT_METHODS[0]);
  const [txRef, setTxRef] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputCls =
    'w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-teal-600';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error: err } = await supabase.from('payment_confirmations').insert({
      listing_title: listingTitle.trim(),
      payment_method: method,
      transaction_ref: txRef.trim(),
    });
    setBusy(false);
    if (err) {
      setError(t.payConfirmError);
      return;
    }
    setSent(true);
  };

  return (
    <GlassModal title={t.upgradeTitle} onClose={onClose} labelledBy="upgrade-title">
      <div id="upgrade-title" className="space-y-4">
        <div className="flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-400 text-amber-950">
            <Star className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-bold text-gray-900">{t.featuredOption}</h3>
            <p className="text-xs text-gray-600">{t.featuredDesc}</p>
          </div>
          <span className="ms-auto shrink-0 text-lg font-extrabold text-gray-900">{t.payPrice}</span>
        </div>

        <div className="space-y-2">
          <a
            href={PAYPAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#ffc439] px-6 py-3 text-sm font-bold text-[#003087] shadow transition hover:bg-[#f5b900]"
          >
            <Wallet className="h-4 w-4" /> {t.payPaypal} <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <p className="pt-1 text-xs font-bold uppercase tracking-wide text-gray-500">{t.payCryptoTitle}</p>
          {WALLETS.map((w) => (
            <WalletRow key={w.label} label={w.label} address={w.address} />
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3 rounded-2xl border border-teal-200 bg-teal-50 p-4">
          <h3 className="font-bold text-gray-900">{t.payConfirmTitle}</h3>
          {sent ? (
            <p className="rounded-lg bg-teal-100 px-3 py-2 text-sm text-teal-900">{t.payConfirmSuccess}</p>
          ) : (
            <>
              <input
                required
                value={listingTitle}
                onChange={(e) => setListingTitle(e.target.value)}
                placeholder={t.listingTitle}
                className={inputCls}
              />
              <select value={method} onChange={(e) => setMethod(e.target.value)} className={inputCls}>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <input
                required
                value={txRef}
                onChange={(e) => setTxRef(e.target.value)}
                placeholder={t.payTxLabel}
                className={inputCls}
              />
              {error && <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800">{error}</p>}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full bg-teal-600 px-6 py-3 font-semibold text-white transition hover:bg-teal-500 disabled:opacity-60"
              >
                {busy ? t.publishing : t.payConfirmSubmit}
              </button>
            </>
          )}
        </form>

        <p className="flex items-center justify-center gap-2 pt-1 text-xs text-gray-500">
          <ShieldCheck className="h-4 w-4 text-teal-600" /> {t.payWith} PayPal · USDT (TRC20) · {t.operatedBy}
        </p>
      </div>
    </GlassModal>
  );
}
