import { useState } from 'react';
import { FileText, Gavel, MessagesSquare, Send, Sparkles, X, GraduationCap } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import type { Lang } from '@/lib/translations';

type Tool = 'cv' | 'legal' | 'interview' | 'diploma';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

const TOOL_SYSTEM: Record<Tool, (langName: string) => string> = {
  cv: (l) =>
    `You are a Europass CV specialist. Using the information provided, produce a clean, well-structured Europass-style CV in ${l} using these sections: Personal information, Work experience, Education and training, Language skills, Skills. Use clear headings and bullet points. If information is missing, insert [placeholder].`,
  legal: (l) =>
    `You are a legal-information assistant for immigrants and EU citizens in Spain, France and the EU. Answer in ${l}. Give practical, accurate general information about visas, residence registration (empadronamiento, NIE), work permits, tenants' rights and EU free movement. Always end with a reminder that this is general information, not legal advice, and recommend official sources (EU-LEX,Seg-Social, prefectures, OMAI) or a qualified professional for the user's specific case.`,
  interview: (l) =>
    `You are an interview coach for the European job market. Respond in ${l}. Ask one realistic interview question at a time for the user's target role; after each user answer, give brief constructive feedback (what was good, what to improve) and then ask the next question. Keep a supportive tone.`,
  diploma: (l) =>
    `You are a credential-recognition advisor (ENIC-NARIC network). Answer in ${l}. Given a user's diploma and target country/job, explain: how the qualification is typically classified (ISCO/ESQF-QF-EQF level), whether formal recognition is likely needed for that job, and the practical steps (ENIC-NARIC contact, professional bodies, document legalization). Note this is general guidance and the national ENIC-NARIC centre gives binding answers.`,
};

export default function AiDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang } = useLang();
  const [tool, setTool] = useState<Tool>('cv');
  const [result, setResult] = useState('');
  const [prompt, setPrompt] = useState('');
  const [chat, setChat] = useState('');
  const [history, setHistory] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const langName = { en: 'English', es: 'Spanish', fr: 'French', ar: 'Arabic' }[lang as Lang] ?? 'English';

  const runTool = async () => {
    if (!GEMINI_API_KEY || !prompt.trim()) return;
    setBusy(true);
    setError(false);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: TOOL_SYSTEM[tool](langName) }] },
            contents: [
              ...(tool === 'interview'
                ? history.slice(-10).map((m) => ({ role: m.role, parts: [{ text: m.text }] }))
                : []),
              { role: 'user', parts: [{ text: prompt }] },
            ],
          }),
        }
      );
      if (!res.ok) throw new Error(String(res.status));
      const body = await res.json();
      const text: string | undefined = body?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('');
      if (!text) throw new Error('empty');
      if (tool === 'interview') {
        setChat(text);
        setHistory((h) => [...h, { role: 'user', text: prompt }, { role: 'model', text }]);
      } else {
        setResult(text);
      }
      setPrompt('');
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  const tools: { id: Tool; icon: typeof FileText; title: string; desc: string }[] = [
    { id: 'cv', icon: FileText, title: t.aiToolCv, desc: t.aiToolCvDesc },
    { id: 'legal', icon: Gavel, title: t.aiToolLegal, desc: t.aiToolLegalDesc },
    { id: 'interview', icon: MessagesSquare, title: t.aiToolInterview, desc: t.aiToolInterviewDesc },
    { id: 'diploma', icon: GraduationCap, title: t.aiToolDiploma, desc: t.aiToolDiplomaDesc },
  ];

  const placeholders: Record<Tool, string> = {
    cv: `${t.aiCvName}, ${t.aiCvRole}, ${t.aiCvExperience}, ${t.aiCvEducation}, ${t.aiCvLangs}`,
    legal: t.aiToolLegalDesc,
    interview: t.aiCvRole,
    diploma: `${t.aiCvEducation} — ${t.selectCountry}`,
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
      <aside
        className="flex h-full w-full max-w-md flex-col border-s border-white/30 bg-slate-900/95 text-white shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/20 p-4">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Sparkles className="h-5 w-5 text-teal-300" /> {t.aiHubTitle}
          </h2>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-white/70 transition hover:bg-white/20 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <p className="text-sm text-white/85">{t.aiHubIntro}</p>

          <div>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-white/70">{t.aiTools}</h3>
            <div className="grid grid-cols-2 gap-2">
              {tools.map(({ id, icon: Icon, title, desc }) => (
                <button
                  key={id}
                  onClick={() => setTool(id)}
                  className={`rounded-xl border p-3 text-start transition ${
                    tool === id ? 'border-teal-300 bg-teal-600/40' : 'border-white/25 bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <Icon className="h-5 w-5 text-teal-200" />
                  <p className="mt-1.5 text-sm font-semibold leading-tight">{title}</p>
                  <p className="mt-1 line-clamp-2 text-[11px] text-white/75">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/25 bg-white/10 p-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder={placeholders[tool]}
              className="w-full rounded-lg border border-white/30 bg-slate-800 px-3 py-2 text-sm outline-none focus:border-teal-400"
            />
            <button
              onClick={runTool}
              disabled={busy || !prompt.trim()}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-teal-500 px-4 py-2 text-sm font-bold transition hover:opacity-90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> {busy ? t.aiThinking : t.aiAsk}
            </button>
            {error && <p className="mt-2 rounded-lg bg-red-500/30 px-3 py-2 text-sm text-red-100">{t.aiError}</p>}
          </div>

          {(result || chat) && (
            <div className="rounded-xl border border-teal-300/40 bg-teal-900/40 p-4">
              <h3 className="text-sm font-bold uppercase tracking-wide text-teal-200">{t.aiResult}</h3>
              <pre className="mt-2 whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-white">
                {result || chat}
              </pre>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
