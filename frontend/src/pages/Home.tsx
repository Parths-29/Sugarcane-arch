import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Map, Droplets, Brain, ArrowRight, TrendingUp, CloudRain, Bell, ShieldCheck, Calculator, FileText, Cpu, Bird } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { MOCK_ARTICLES } from "@/lib/mockData";

const stats = [
  { icon: Users, labelKey: "farmersServed" as const, value: "2,400+", color: "from-green-500 to-emerald-600" },
  { icon: Map, labelKey: "plotsDigitized" as const, value: "850", color: "from-lime-500 to-green-600" },
  { icon: Droplets, labelKey: "waterSaved" as const, value: "32%", color: "from-teal-500 to-cyan-600" },
  { icon: Brain, labelKey: "aiModels" as const, value: "3", color: "from-emerald-500 to-green-700" },
  // New stats
  { icon: CloudRain, labelKey: "waterSaved" as const, value: "1.2M L", color: "from-blue-500 to-cyan-600" },
  { icon: TrendingUp, labelKey: "plotsDigitized" as const, value: "+18%", color: "from-indigo-500 to-purple-600" },
  { icon: Bell, labelKey: "aiModels" as const, value: "15k+", color: "from-orange-500 to-red-600" },
  { icon: ShieldCheck, labelKey: "farmersServed" as const, value: "99.9%", color: "from-emerald-400 to-teal-500" },
];

const exploreCards = [
  {
    titleKey: "analysis" as const,
    descKey: "exploreSolutionDesc" as const, // reusing for now
    icon: Calculator,
    color: "from-amber-400 to-orange-500",
    link: "/analysis",
  },
  {
    titleKey: "weather" as const,
    descKey: "exploreSolutionDesc" as const,
    icon: CloudRain,
    color: "from-blue-400 to-indigo-500",
    link: "/weather",
  },
  {
    titleKey: "livestock" as const,
    descKey: "exploreProblemDesc" as const,
    icon: Bird,
    color: "from-purple-400 to-pink-500",
    link: "/livestock",
  },
  {
    titleKey: "iot" as const,
    descKey: "exploreProblemDesc" as const,
    icon: Cpu,
    color: "from-cyan-400 to-blue-500",
    link: "/iot",
  },
  {
    titleKey: "reports" as const,
    descKey: "exploreNewsDesc" as const,
    icon: FileText,
    color: "from-green-400 to-emerald-500",
    link: "/reports",
  },
];

// Combine img1 and some article thumbnails for the carousel
const CAROUSEL_IMAGES = [
  "/img1.jpg",
  MOCK_ARTICLES[0].thumbnail,
  MOCK_ARTICLES[2].thumbnail,
  MOCK_ARTICLES[3].thumbnail,
];

export default function Home() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  // Background carousel timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="page-container bg-neutral-50 dark:bg-neutral-950 min-h-screen transition-colors duration-300">
      <Navbar />

      <main className="flex-1">
        {/* Full Bleed Hero Section */}
        <section className="relative w-full h-[calc(100vh-64px)] min-h-[500px] overflow-hidden">
          {/* Background Carousel */}
          <div className="absolute inset-0 bg-neutral-900">
            <AnimatePresence mode="popLayout">
              <motion.img
                key={currentImageIdx}
                src={CAROUSEL_IMAGES[currentImageIdx]}
                alt="Sugarcane fields"
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-neutral-900/60 dark:bg-neutral-900/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-50 dark:from-neutral-950 via-transparent to-transparent opacity-90" />
          </div>
          
          <div className="relative h-full flex flex-col justify-center px-4 sm:px-8 max-w-[1200px] mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Side: Pitch */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-xl"
              >
                <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1] drop-shadow-lg">
                  <span className="block text-green-400 mb-2 text-2xl sm:text-3xl font-bold tracking-wide">
                    {t("welcomePrefix")} {currentUser?.name || "Farmer"}
                  </span>
                  The Future of Sugarcane Farming
                </h1>
                <p className="text-neutral-200 mt-6 text-lg sm:text-xl font-medium leading-relaxed drop-shadow-md">
                  {t("homePitch")}
                </p>
                <div className="mt-8 flex items-center gap-3">
                  <span className="text-white font-semibold tracking-wide text-sm bg-white/20 px-5 py-2.5 rounded-full backdrop-blur-md border border-white/20 shadow-xl">
                    KIAAR × Godavari Biorefineries Ltd.
                  </span>
                </div>
              </motion.div>

              {/* Right Side: Glassmorphism Graph */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="hidden md:block"
              >
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                  
                  <div className="relative">
                    <h3 className="text-white font-bold text-lg mb-1 drop-shadow-md">Sugarcane Yield Growth</h3>
                    <p className="text-green-300 text-sm font-medium mb-6 drop-shadow-md">Tons per Acre (2020-2024)</p>
                    
                    {/* SVG Line Graph */}
                    <div className="relative h-48 w-full">
                      {/* Grid lines */}
                      <div className="absolute inset-0 flex flex-col justify-between opacity-20">
                        {[0, 1, 2, 3].map(i => <div key={i} className="w-full h-px bg-white" />)}
                      </div>
                      
                      <svg viewBox="0 0 400 200" className="w-full h-full drop-shadow-2xl overflow-visible">
                        {/* Glow filter */}
                        <defs>
                          <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                            <feMerge>
                              <feMergeNode in="coloredBlur"/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                        </defs>
                        
                        <motion.path
                          d="M 0,160 C 100,160 100,110 200,100 C 300,90 300,40 400,20"
                          fill="none"
                          stroke="#4ade80"
                          strokeWidth="4"
                          filter="url(#glow)"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
                        />
                        <motion.path
                          d="M 0,160 C 100,160 100,110 200,100 C 300,90 300,40 400,20 L 400,200 L 0,200 Z"
                          fill="url(#gradient)"
                          opacity="0.2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.2 }}
                          transition={{ duration: 1, delay: 2 }}
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4ade80" />
                            <stop offset="100%" stopColor="transparent" />
                          </linearGradient>
                        </defs>
                        
                        {/* Data Points */}
                        {[
                          { cx: 0, cy: 160 },
                          { cx: 200, cy: 100 },
                          { cx: 400, cy: 20 },
                        ].map((point, i) => (
                          <motion.circle
                            key={i}
                            cx={point.cx}
                            cy={point.cy}
                            r="6"
                            fill="#ffffff"
                            stroke="#16a34a"
                            strokeWidth="3"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1 + i * 0.5, type: "spring" }}
                          />
                        ))}
                      </svg>
                      
                      {/* X Axis Labels */}
                      <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-white/70 text-xs font-semibold">
                        <span>2020</span>
                        <span>2022</span>
                        <span>2024</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Grid - Moved below fold */}
        <section className="px-4 sm:px-8 max-w-[1200px] mx-auto pt-16 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 stagger-children">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-xl shadow-green-900/5 dark:shadow-black/20 border border-neutral-100 dark:border-neutral-800 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300"
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-current/20`}
                >
                  <stat.icon size={24} className="text-white" />
                </div>
                <p className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
                  {stat.value}
                </p>
                <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 font-medium mt-1">
                  {/* Using labelKey if it matches our translations, else generic string */}
                  {t(stat.labelKey)}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Explore Cards */}
        <section className="px-4 sm:px-8 max-w-[1200px] mx-auto py-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              {t("exploreCards")}
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 stagger-children">
            {exploreCards.map((card, i) => (
              <Link
                key={i}
                to={card.link}
                className="group bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-6 shadow-md hover:shadow-2xl shadow-neutral-200/50 dark:shadow-black/50 hover:-translate-y-2 transition-all duration-300 flex flex-col h-full"
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-current/20 group-hover:scale-110 transition-transform duration-300`}
                >
                  <card.icon size={24} className="text-white" />
                </div>
                <h3 className="font-bold text-neutral-900 dark:text-white text-lg tracking-tight mb-2">
                  {t(card.titleKey)}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed flex-1">
                  {t(card.descKey)}
                </p>
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs font-bold mt-5 group-hover:gap-3 transition-all">
                  <span className="uppercase tracking-wider">{t("readMore")}</span>
                  <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
