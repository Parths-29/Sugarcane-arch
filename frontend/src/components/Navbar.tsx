import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { Droplets, LogOut, Home, Newspaper, Moon, Sun, Calculator, CloudRain, FileText, Cpu, Package } from "lucide-react";

export function Navbar() {
  const { logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const isDarkStored = localStorage.getItem("theme") === "dark" ||
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDarkStored) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { path: "/home", icon: Home, labelKey: "home" as const },
    { path: "/analysis", icon: Calculator, labelKey: "analysis" as const },
    { path: "/weather", icon: CloudRain, labelKey: "weather" as const },
    { path: "/inventory", icon: Package, labelKey: "inventory" as const },
    { path: "/iot", icon: Cpu, labelKey: "iot" as const },
    { path: "/reports", icon: FileText, labelKey: "reports" as const },
    { path: "/news", icon: Newspaper, labelKey: "news" as const },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg border-b border-green-100 dark:border-neutral-800 shadow-sm transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo (Top Left) */}
        <Link to="/home" className="flex items-center gap-3 group mr-8">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <Droplets size={24} className="text-white" />
          </div>
          <span className="font-extrabold text-xl text-green-800 dark:text-green-400 tracking-tight transition-colors">
            {t("appName")}
          </span>
        </Link>

        {/* Nav Links and Controls (Top Right) */}
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
          <div className="flex items-center gap-1 bg-neutral-100/50 dark:bg-neutral-800/50 p-1 rounded-xl">
            {navLinks.map((link) => {
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-green-600 text-white shadow-sm"
                      : "text-neutral-600 dark:text-neutral-300 hover:text-green-700 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30"
                  }`}
                >
                  <link.icon size={16} />
                  <span className="hidden lg:inline">{t(link.labelKey)}</span>
                </Link>
              );
            })}
          </div>

          <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-700 hidden sm:block"></div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="shrink-0">
            <LanguageToggle />
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-1 shrink-0"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">{t("logout")}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
