import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Droplets, AlertTriangle } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { InputField } from "@/components/ui/InputField";
import { Button } from "@/components/ui/Button";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { validateLogin } from "@/lib/validation";
import type { TranslationKey } from "@/lib/translations";

export default function Login() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, TranslationKey>>({});
  const [loading, setLoading] = useState(false);
  const [failCount, setFailCount] = useState(0);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrors({});

      // Basic validation
      const validationErrors = validateLogin({ phone, password });

      if (validationErrors.length > 0) {
        const errorMap: Record<string, TranslationKey> = {};
        validationErrors.forEach((err) => {
          errorMap[err.field] = err.message as TranslationKey;
        });
        setErrors(errorMap);

        // Count failures for wrong phone/password (not empty field errors)
        const isAuthError = validationErrors.some(
          (e) =>
            e.message === "noAccountFound" || e.message === "incorrectPassword"
        );
        if (isAuthError) {
          setFailCount((prev) => prev + 1);
        }
        return;
      }

      // Simulate loading delay (1s)
      setLoading(true);
      // Wait a tiny bit just for UI feel, or remove the delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      try {
        const user = await login(phone, password);
        setLoading(false);

        if (user) {
          navigate("/home");
        }
      } catch (err: any) {
        setLoading(false);
        setFailCount((prev) => prev + 1);
        alert(`Login Error: ${err.message}`);
        
        if (err.message.includes('password')) {
          setErrors({ password: "incorrectPassword" as TranslationKey });
        } else {
          setErrors({ phone: "noAccountFound" as TranslationKey });
        }
      }
    },
    [phone, password, login, navigate]
  );

  return (
    <AuroraBackground className="min-h-screen h-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-auto px-4"
      >
        {/* Language toggle */}
        <div className="flex justify-end mb-4">
          <LanguageToggle />
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-green-900/10 border border-green-100 p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-600/30">
              <Droplets size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-green-900 font-[Outfit]">
              {t("loginTitle")}
            </h1>
            <p className="text-neutral-500 mt-1 text-sm">
              {t("loginSubtitle")}
            </p>
          </div>

          {/* Forgot password prompt after 3 failures */}
          {failCount >= 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 mb-5"
            >
              <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">{t("forgotPassword")}</p>
                <p className="text-xs mt-0.5 text-amber-700">
                  {t("forgotPasswordHint")}
                </p>
              </div>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <InputField
              id="login-phone"
              label="phoneNumber"
              type="tel"
              value={phone}
              onChange={setPhone}
              placeholder="9876543210"
              error={errors.phone || null}
              required
            />

            <InputField
              id="login-password"
              label="password"
              type="password"
              value={password}
              onChange={setPassword}
              error={errors.password || null}
              required
            />

            <Button
              id="login-submit"
              type="submit"
              className="w-full mt-2"
              loading={loading}
            >
              {loading ? t("loading") : t("login")}
            </Button>
          </form>

          {/* Sign up link */}
          <p className="text-center text-sm text-neutral-500 mt-5">
            {t("noAccount")}{" "}
            <Link
              to="/signup"
              className="text-green-700 font-semibold hover:underline"
            >
              {t("signUpLink")}
            </Link>
          </p>
        </div>
      </motion.div>
    </AuroraBackground>
  );
}
