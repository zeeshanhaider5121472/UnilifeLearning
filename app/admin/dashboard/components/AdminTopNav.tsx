import ThemeToggle from "@/components/ThemeToggle";
import { AuthContextType } from "@/lib/types";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FiLogOut } from "react-icons/fi";

interface AdminTopNavProps {
  user: Exclude<AuthContextType["user"], null>; // User only
  logout: AuthContextType["logout"]; // () => void
}

export default function AdminTopNav({ user, logout }: AdminTopNavProps) {
  const router = useRouter();

  // {/* Top Navbar */}
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 glass"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-slate-900 dark:text-white font-bold">
            R
          </div>
          <span className="text-lg font-bold gradient-text">
            Unilife Learning Admin
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 glass rounded-xl px-4 py-2">
            <span className="text-lg">🛡️</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {user.name}
            </span>
          </div>
          <ThemeToggle />
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="p-2.5 rounded-xl hover:bg-white/50 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:text-red-400 transition"
          >
            <FiLogOut />
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
