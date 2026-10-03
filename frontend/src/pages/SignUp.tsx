import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, CheckCircle2 } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { InputField } from "@/components/ui/InputField";
import { Button } from "@/components/ui/Button";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { validateSignUp } from "@/lib/validation";
import type { TranslationKey } from "@/lib/translations";

export default function SignUp() {
  const { signup } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [village, setVillage] = useState("");
  const [errors, setErrors] = useState<Record<string, TranslationKey>>({});
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateSignUp(
      { name, phone, password, confirmPassword, village }
    );

    if (validationErrors.length > 0) {
      const errorMap: Record<string, TranslationKey> = {};
      validationErrors.forEach((err) => {
        errorMap[err.field] = err.message as TranslationKey;
      });
      setErrors(errorMap);
      return;
    }

    try {
      // Success
      await signup({
        name: name.trim(),
        phone,
        password,
        village: village.trim(),
        language,
      });

      setErrors({});
      setSuccess(true);

      // Redirect to login after a brief delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      alert(`Signup Error: ${err.message}`);
      setErrors({ phone: "duplicatePhone" as TranslationKey });
    }
  };

  return (
    <AuroraBackground className="min-h-screen h-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-auto px-4"
      >
        {/* Language toggle at top */}
        <div className="flex justify-end mb-4">
          <LanguageToggle />
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-green-900/10 border border-green-100 p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-600/30">
              <UserPlus size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-green-900 font-[Outfit]">
              {t("signUpTitle")}
            </h1>
            <p className="text-neutral-500 mt-1 text-sm">
              {t("signUpSubtitle")}
            </p>
          </div>

          {/* Success Banner */}
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 mb-5"
            >
              <CheckCircle2 size={20} className="text-green-600 shrink-0" />
              <p className="text-sm font-medium">{t("signUpSuccess")}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <InputField
              id="signup-name"
              label="fullName"
              value={name}
              onChange={setName}
              error={errors.name || null}
              required
            />

            <InputField
              id="signup-phone"
              label="phoneNumber"
              type="tel"
              value={phone}
              onChange={setPhone}
              placeholder="9876543210"
              error={errors.phone || null}
              required
            />

            <InputField
              id="signup-password"
              label="password"
              type="password"
              value={password}
              onChange={setPassword}
              error={errors.password || null}
              hint="Minimum 6 characters"
              required
            />

            <InputField
              id="signup-confirm-password"
              label="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              error={errors.confirmPassword || null}
              required
            />

            <InputField
              id="signup-village"
              label="villageTaluka"
              value={village}
              onChange={setVillage}
              placeholder="e.g. Athani, Bagalkot"
            />

            <Button
              id="signup-submit"
              type="submit"
              className="w-full mt-2"
              disabled={success}
            >
              {t("signUp")}
            </Button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-neutral-500 mt-5">
            {t("alreadyHaveAccount")}{" "}
            <Link
              to="/login"
              className="text-green-700 font-semibold hover:underline"
            >
              {t("loginLink")}
            </Link>
          </p>
        </div>
      </motion.div>
    </AuroraBackground>
  );
}
