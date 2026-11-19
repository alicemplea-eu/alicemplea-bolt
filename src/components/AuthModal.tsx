import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useLang } from '@/lib/LanguageContext';
import { GlassModal } from '@/components/ui';

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const { t } = useLang();
  const { session, signIn, signUp, signInWithGoogle, signOut } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    if (mode === 'signin') {
      const { error: err } = await signIn(email, password);
      if (err) setError(err);
      else onClose();
    } else {
      const { error: err, needsConfirmation } = await signUp(email, password);
      if (err) setError(err);
      else if (needsConfirmation) setInfo(email);
      else onClose();
    }
    setBusy(false);
  };

  return (
    <GlassModal title={session ? t.signedInAs : t.signInTitle} onClose={onClose} labelledBy="auth-title">
      {session ? (
        <div>
          <p className="text-sm text-gray-700">
            {t.signedInAs}: <span className="font-semibold">{session.user.email}</span>
          </p>
          <button
            onClick={async () => {
              await signOut();
              onClose();
            }}
            className="mt-4 w-full rounded-full bg-slate-800 px-6 py-3 font-semibold text-white transition hover:bg-slate-700"
          >
            {t.signOut}
          </button>
        </div>
      ) : (
        <div id="auth-title">
          <p className="text-sm leading-relaxed text-gray-700">{t.signInBody}</p>
          <form onSubmit={submit} className="mt-4 space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.email}
              autoComplete="email"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-teal-600"
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.password}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-teal-600"
            />
            {error && <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800">{error}</p>}
            {info && (
              <p className="rounded-lg bg-teal-100 px-3 py-2 text-sm text-teal-900">
                {t.signUp}: {info}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-teal-600 px-6 py-3 font-semibold text-white transition hover:bg-teal-500 disabled:opacity-60"
            >
              {busy ? t.publishing : mode === 'signin' ? t.signIn : t.signUp}
            </button>
          </form>
          <div className="my-4 flex items-center gap-3 text-xs text-gray-500">
            <span className="h-px flex-1 bg-gray-300" /> {t.orGoogle} <span className="h-px flex-1 bg-gray-300" />
          </div>
          <button
            onClick={signInWithGoogle}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
              <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3a7.2 7.2 0 0 1-10.8-3.8H1.2v3.1A12 12 0 0 0 12 24z" />
              <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.2a12 12 0 0 0 0 10.8l4.1-3.1z" />
              <path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.5-3.5A12 12 0 0 0 1.2 6.6l4.1 3.1A7.2 7.2 0 0 1 12 4.8z" />
            </svg>
            Google
          </button>
          <p className="mt-4 text-center text-sm text-gray-600">
            {mode === 'signin' ? t.noAccount : t.haveAccount}{' '}
            <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="font-semibold text-teal-700 underline">
              {mode === 'signin' ? t.signUp : t.signIn}
            </button>
          </p>
        </div>
      )}
    </GlassModal>
  );
}
