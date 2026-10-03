import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  loading = false,
  disabled = false,
  className,
  id,
}: ButtonProps) {
  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold rounded-xl px-6 py-3.5 text-base transition-all duration-200",
        "min-h-[52px] min-w-[120px]", // Large tap targets
        "active:scale-[0.98]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        variant === "primary" &&
          "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-600/25 hover:shadow-xl hover:shadow-green-600/30 hover:from-green-700 hover:to-emerald-700",
        variant === "secondary" &&
          "bg-white border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300",
        variant === "ghost" &&
          "bg-transparent text-green-700 hover:bg-green-50",
        className
      )}
    >
      {loading && <Loader2 size={20} className="animate-spin" />}
      {children}
    </button>
  );
}
