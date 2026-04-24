'use client';

import { motion } from 'framer-motion';
import { useTheme } from './ThemeProvider';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full bg-gray-200 dark:bg-white/10 transition-colors flex items-center p-1"
      whileTap={{ scale: 0.9 }}
      aria-label="Toggle theme"
    >
      <motion.div
        className="w-5 h-5 rounded-full bg-white dark:bg-violet-500 shadow-md flex items-center justify-center"
        animate={{ x: theme === 'dark' ? 26 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {theme === 'dark' ? (
          <FiMoon className="text-white text-xs" />
        ) : (
          <FiSun className="text-amber-500 text-xs" />
        )}
      </motion.div>
    </motion.button>
  );
}