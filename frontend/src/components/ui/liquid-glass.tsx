import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function LiquidGlassContainer({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-8 sm:p-12 ${className}`}
    >
      {/* Glossy top highlight */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
      
      {/* Subtle animated gradient background */}
      <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/5 to-transparent animate-spin-slow pointer-events-none" style={{ animationDuration: '15s' }} />
      
      {/* Content wrapper to keep z-index above the effects */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

export function LiquidGlassButton({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border border-white/30 bg-white/20 backdrop-blur-md px-8 py-4 font-bold text-white shadow-lg transition-colors hover:bg-white/30 ${className}`}
    >
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
      <span className="relative z-10 tracking-wide drop-shadow-md">{children}</span>
    </motion.button>
  );
}
