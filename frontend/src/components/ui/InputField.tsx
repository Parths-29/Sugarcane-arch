import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import type { TranslationKey } from "@/lib/translations";
import { useLanguage } from "@/context/LanguageContext";

interface InputFieldProps {
  id: string;
  label: TranslationKey;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: TranslationKey | null;
  hint?: string;
  required?: boolean;
  className?: string;
}

export function InputField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  hint,
  required = false,
  className,
}: InputFieldProps) {
  const { t } = useLanguage();

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={id}
        className="text-sm font-semibold text-neutral-700"
      >
        {t(label)}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full px-4 py-3 rounded-xl border-2 text-base transition-all duration-200",
          "bg-white/80 backdrop-blur-sm text-neutral-900",
          "focus:outline-none focus:ring-2 focus:ring-offset-1",
          error
            ? "border-red-400 focus:ring-red-300 focus:border-red-500"
            : "border-neutral-200 focus:ring-green-300 focus:border-green-500",
          "placeholder:text-neutral-400"
        )}
      />
      {hint && !error && (
        <p className="text-xs text-neutral-500 mt-0.5">{hint}</p>
      )}
      {error && (
        <div className="flex items-center gap-1.5 text-red-600 mt-0.5 animate-fade-in">
          <AlertCircle size={14} className="shrink-0" />
          <p className="text-sm font-medium">{t(error)}</p>
        </div>
      )}
    </div>
  );
}
