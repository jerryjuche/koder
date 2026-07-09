"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUser } from "@/lib/UserContext";

const languages = [
  {
    id: "go",
    name: "Go",
    description: "Fast compilation, goroutines, static typing",
    icon: "🐹",
    gradient: "from-blue-600/20 to-blue-900/20",
    border: "border-blue-500/30",
    hoverBorder: "group-hover:border-blue-400",
    accent: "bg-blue-500",
    cta: "Start Learning Go",
  },
  {
    id: "python",
    name: "Python",
    description: "Readable syntax, vast ecosystem, dynamic typing",
    icon: "🐍",
    gradient: "from-emerald-600/20 to-emerald-900/20",
    border: "border-emerald-500/30",
    hoverBorder: "group-hover:border-emerald-400",
    accent: "bg-emerald-500",
    cta: "Start Learning Python",
  },
];

export default function LanguageSelector() {
  const router = useRouter();
  const { setPrimaryLanguage } = useUser();

  const handleSelect = async (lang: string) => {
    await setPrimaryLanguage(lang);
    router.push("/home");
  };

  const handleSkip = async () => {
    await setPrimaryLanguage("go");
    router.push("/home");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0A0C0F 0%, #0F1115 100%)" }}
    >
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl font-bold text-white mb-3">
            Choose Your Language
          </h1>
          <p className="text-gray-400 text-sm">
            Pick the language you want to learn with. You can switch anytime.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {languages.map((lang, i) => (
            <motion.button
              key={lang.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.15 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(lang.id)}
              className={`group relative overflow-hidden rounded-2xl p-6 text-left border ${lang.border} ${lang.hoverBorder} transition-all bg-gradient-to-br ${lang.gradient} backdrop-blur-sm`}
            >
              <div className="text-4xl mb-4">{lang.icon}</div>
              <h2 className="text-xl font-bold text-white mb-2">{lang.name}</h2>
              <p className="text-sm text-gray-400 mb-5">{lang.description}</p>
              <span className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold text-white ${lang.accent} opacity-90 group-hover:opacity-100 transition-opacity`}>
                {lang.cta}
              </span>
            </motion.button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-4"
          >
            Skip for now (defaults to Go)
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
