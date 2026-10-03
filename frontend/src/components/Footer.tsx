import { Link } from "react-router-dom";
import { Droplets, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-green-900 dark:bg-neutral-900 text-white mt-auto">
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center">
                <Droplets size={20} className="text-white" />
              </div>
              <span className="font-extrabold text-lg tracking-tight">DesiCane</span>
            </div>
            <p className="text-green-200/70 text-sm leading-relaxed">
              Smart Irrigation Advisory for Sugarcane — powered by AI, IoT, and agronomic science.
            </p>
            <p className="text-green-200/50 text-xs mt-3">KIAAR × Godavari Biorefineries Ltd.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-green-300 mb-4">Platform</h4>
            <ul className="space-y-2">
              {[
                { to: "/analysis", label: "Crop Analysis" },
                { to: "/weather", label: "Weather" },
                { to: "/livestock", label: "Livestock" },
                { to: "/iot", label: "IoT Sensors" },
                { to: "/reports", label: "Reports" },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-green-200/70 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-green-300 mb-4">Resources</h4>
            <ul className="space-y-2">
              {[
                { to: "/news", label: "News & Advisory" },
                { to: "/home", label: "Dashboard" },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-green-200/70 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-green-300 mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-green-200/70">
                <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                <span>KIAAR Campus, Belgaum, Karnataka 590001</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-green-200/70">
                <Phone size={16} className="flex-shrink-0" />
                <span>1800-XXX-XXXX (Toll Free)</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-green-200/70">
                <Mail size={16} className="flex-shrink-0" />
                <span>support@DesiCane.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-green-800 dark:border-neutral-700 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-green-200/50">© 2026 DesiCane. All rights reserved.</p>
          <p className="text-xs text-green-200/40">Built with ❤️ for Indian Farmers</p>
        </div>
      </div>
    </footer>
  );
}
