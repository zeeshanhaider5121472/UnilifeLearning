'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import MonsterMascot from '@/components/MonsterMascot';
import ThemeToggle from '@/components/ThemeToggle';
import toast from 'react-hot-toast';
import { FiUser, FiLock, FiArrowRight } from 'react-icons/fi';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      const user = await login(username, password);
      if (user) {
        toast.success(`Welcome back, ${user.name}!`);
        switch (user.role) {
          case 'student': router.push('/student/dashboard'); break;
          case 'teacher': router.push('/teacher/dashboard'); break;
          case 'admin': router.push('/admin/dashboard'); break;
        }
      } else {
        toast.error('Invalid credentials');
      }
    } catch {
      toast.error('Login failed. Is the server running?');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-center mb-8">
          <MonsterMascot size={120} color="purple" />
        </div>

        <div className="glass-strong rounded-3xl p-8">
          <motion.h1
            className="text-3xl font-bold text-center gradient-text mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Welcome Back
          </motion.h1>
          <p className="text-slate-600 dark:text-gray-400 text-center mb-8">
            Sign in to access your dashboard
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <label className="text-sm text-slate-600 dark:text-gray-400 mb-1.5 block">Username</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:border-violet-500 transition-colors"
                  placeholder="Enter your username"
                />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <label className="text-sm text-slate-600 dark:text-gray-400 mb-1.5 block">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:border-violet-500 transition-colors"
                  placeholder="Enter your password"
                />
              </div>
            </motion.div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold text-lg flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300 disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                    Sign In <FiArrowRight />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          {/* DEMO QUICK LOGIN BUTTONS REMOVED */}
        {/* Quick login buttons */}
        {/* <motion.div
          className="mt-6 pt-6 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-xs text-gray-500 text-center mb-3">Quick Demo Login</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Student', user: 'haider', pass: 'student123', color: 'from-teal-600 to-cyan-600' },
              { label: 'Teacher', user: 'mrsmith', pass: 'teacher123', color: 'from-violet-600 to-purple-600' },
              { label: 'Admin', user: 'admin', pass: 'admin123', color: 'from-amber-600 to-orange-600' },
            ].map((q) => (
              <button
                key={q.label}
                onClick={async () => {
                  setUsername(q.user);
                  setPassword(q.pass);
                  setIsLoading(true);
                  try {
                    const u = await login(q.user, q.pass);
                    if (u) {
                      toast.success(`Welcome, ${u.name}!`);
                      switch (u.role) {
                        case 'student': router.push('/student/dashboard'); break;
                        case 'teacher': router.push('/teacher/dashboard'); break;
                        case 'admin': router.push('/admin/dashboard'); break;
                      }
                    }
                  } catch { toast.error('Login failed'); }
                  setIsLoading(false);
                }}
                className={`py-2 rounded-lg bg-gradient-to-r ${q.color} text-white text-xs font-semibold hover:opacity-90 transition-opacity`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </motion.div> */}
        </div>

        <motion.button
          onClick={() => router.push('/')}
          className="w-full mt-4 text-slate-500 dark:text-gray-500 text-sm hover:text-violet-400 transition-colors text-center"
          whileHover={{ scale: 1.02 }}
        >
          ← Back to Home
        </motion.button>
      </motion.div>
    </div>
  );
}
