import { Link } from "react-router-dom";
import { Leaf, Sprout, Droplets, Brain } from "lucide-react";
import { LiquidGlassContainer, LiquidGlassButton } from "@/components/ui/liquid-glass";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";

const features = [
  { icon: Sprout, title: "Yield Tracking", delay: 0.2 },
  { icon: Droplets, title: "Water Analytics", delay: 0.4 },
  { icon: Brain, title: "AI Predictions", delay: 0.6 },
];

export default function Landing() {
  const { currentUser } = useAuth();

  if (currentUser) {
    return <Navigate to="/home" replace />;
  }

  return (
    <AuroraBackground showRadialGradient={true}>
      <div className="relative z-10 w-full max-w-[1200px] px-4 flex flex-col lg:flex-row items-center justify-between gap-12 mt-10">
        
        {/* Left Side: Main Content */}
        <div className="flex-1 text-center lg:text-left">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-300 text-sm font-semibold mb-6 backdrop-blur-sm"
          >
            <Leaf size={16} /> Welcome to the future of farming
          </motion.div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-white tracking-tight drop-shadow-2xl mb-6 leading-tight">
            Aqua<span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Cane</span>
          </h1>
          
          <p className="text-lg sm:text-2xl text-neutral-300 font-medium max-w-2xl drop-shadow-md mb-10 leading-relaxed">
            The intelligent ecosystem for sugarcane farming. Manage your inventory, analyze yields, monitor weather, and maximize your farm's potential.
          </p>

          <div className="flex flex-col sm:flex-row items-center lg:items-start gap-6">
            <Link to="/signup">
              <LiquidGlassButton className="w-48 text-lg hover:text-green-100">
                Get Started
              </LiquidGlassButton>
            </Link>
            <Link to="/login">
              <LiquidGlassButton className="w-48 text-lg hover:text-green-100 bg-white/10">
                Log In
              </LiquidGlassButton>
            </Link>
          </div>
        </div>

        {/* Right Side: Glass Widgets */}
        <div className="flex-1 w-full max-w-lg relative">
          <LiquidGlassContainer className="p-8">
            <h3 className="text-2xl font-bold text-white mb-6 tracking-tight">Powerful Features</h3>
            <div className="space-y-4">
              {features.map((feature, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: feature.delay, duration: 0.5 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg">
                    <feature.icon size={24} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{feature.title}</h4>
                    <p className="text-sm text-neutral-400">Real-time insights & data</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
          </LiquidGlassContainer>
        </div>

      </div>
    </AuroraBackground>
  );
}
