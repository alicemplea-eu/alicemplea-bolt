import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import AuthModal from '@/components/AuthModal';
import UpgradeModal from '@/components/UpgradeModal';

interface UiContextValue {
  openAuth: () => void;
  openUpgrade: (listingId?: string) => void;
  toast: (msg: string) => void;
}

const UiContext = createContext<UiContextValue | null>(null);

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error('useUi must be used within UiProvider');
  return ctx;
}

export function UiProvider({ children }: { children: ReactNode }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const toast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <UiContext.Provider
      value={{
        openAuth: () => setAuthOpen(true),
        openUpgrade: () => setUpgradeOpen(true),
        toast,
      }}
    >
      {children}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} />}
      {toastMsg && (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-white/30 bg-slate-900/90 px-5 py-2.5 text-sm font-medium text-white shadow-2xl backdrop-blur lg:bottom-8"
        >
          {toastMsg}
        </div>
      )}
    </UiContext.Provider>
  );
}
