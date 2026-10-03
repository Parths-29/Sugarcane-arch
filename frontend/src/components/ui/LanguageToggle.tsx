import { useLanguage } from "@/context/LanguageContext";
import type { Language } from "@/lib/translations";

const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "hi", label: "हिंदी" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "mr", label: "मराठी" },
];

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative flex items-center bg-white/60 backdrop-blur-sm rounded-lg border border-green-200 shadow-sm">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="appearance-none bg-transparent py-2 pl-3 pr-8 text-sm font-semibold text-green-800 outline-none focus:ring-2 focus:ring-green-500 rounded-lg w-full cursor-pointer"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code} className="text-neutral-900 font-medium">
            {lang.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-2 flex items-center text-green-700">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
