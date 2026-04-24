"use client";

import Card3D from "@/components/Card3D";
import FloatingShapes from "@/components/FloatingShapes";
import MonsterMascot from "@/components/MonsterMascot";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FiBook, FiShield, FiUsers } from "react-icons/fi";

const features = [
  {
    icon: <FiBook className="w-8 h-8" />,
    title: "Student Portal",
    desc: "View results, submit tasks, track your progress with fun interactive dashboards",
    color: "teal",
    gradient: "from-teal-500 to-cyan-500",
    glow: "rgba(20,184,166,0.3)",
    role: "student",
  },
  {
    icon: <FiUsers className="w-8 h-8" />,
    title: "Teacher Portal",
    desc: "Manage student results, create tasks, upload grades and screenshots",
    color: "purple",
    gradient: "from-violet-500 to-purple-500",
    glow: "rgba(139,92,246,0.3)",
    role: "teacher",
  },
  {
    icon: <FiShield className="w-8 h-8" />,
    title: "Admin Portal",
    desc: "Full control over students, teachers, and all data in the system",
    color: "amber",
    gradient: "from-amber-500 to-orange-500",
    glow: "rgba(245,158,11,0.3)",
    role: "admin",
  },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen animated-bg relative overflow-hidden">
      <FloatingShapes />
      {/* Navbar */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 glass"
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
              UL
            </div>
            <span className="text-xl font-bold gradient-text">UniLife Learning</span>
          </motion.div>
          <motion.button
            onClick={() => router.push("/login")}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign In
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left - Text */}
            <motion.div
              className="flex-1 text-center lg:text-left"
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div
                className="inline-block px-4 py-1.5 rounded-full glass text-sm text-violet-300 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                ✨ Modern Result Management System
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
                <span className="gradient-text">Track Results</span>
                <br />
                <span className="text-white">The Fun Way</span>
              </h1>
              <p className="text-lg text-gray-400 max-w-lg mb-8">
                An interactive platform where teachers manage grades and
                students track their progress with beautiful dashboards and
                playful 3D companions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <motion.button
                  onClick={() => router.push("/login")}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold text-lg hover:shadow-2xl hover:shadow-violet-500/30 transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started 🚀
                </motion.button>
                <motion.button
                  className="px-8 py-4 rounded-2xl glass text-white font-bold text-lg hover:bg-white/10 transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn More
                </motion.button>
              </div>
            </motion.div>

            {/* Right - Monster */}
            <motion.div
              className="flex-1 flex justify-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5, type: "spring" }}
            >
              <div className="relative">
                {/* Glow rings */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)",
                    width: 350,
                    height: 350,
                    top: -75,
                    left: -75,
                  }}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <MonsterMascot size={200} color="purple" />
                <motion.div
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-sm text-violet-300 glass px-4 py-2 rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  👆 Click me!
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="text-4xl font-bold text-center mb-4 gradient-text"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Choose Your Portal
          </motion.h2>
          <motion.p
            className="text-gray-400 text-center mb-16 text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Sign in with your credentials and access your personalized dashboard
          </motion.p>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Card3D glowColor={f.glow} className="h-full">
                  <div
                    className="glass-strong rounded-2xl p-8 h-full cursor-pointer group shine-effect"
                    onClick={() => router.push("/login")}
                  >
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      {f.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {f.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">{f.desc}</p>
                    <div
                      className={`mt-6 inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${f.gradient} bg-clip-text text-transparent group-hover:gap-3 transition-all duration-300`}
                    >
                      Enter Portal
                      <span>→</span>
                    </div>
                  </div>
                </Card3D>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Credentials */}
      <motion.div
        className="py-16 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto glass-strong rounded-3xl p-10">
          <h3 className="text-2xl font-bold text-center mb-8 gradient-text">
            Demo Credentials
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400 mx-auto mb-3 text-xl">
                🎓
              </div>
              <p className="font-semibold text-teal-400 mb-1">Student</p>
              <p className="text-gray-400">haider / student123</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400 mx-auto mb-3 text-xl">
                👨‍🏫
              </div>
              <p className="font-semibold text-violet-400 mb-1">Teacher</p>
              <p className="text-gray-400">mrsmith / teacher123</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 mx-auto mb-3 text-xl">
                🛡️
              </div>
              <p className="font-semibold text-amber-400 mb-1">Admin</p>
              <p className="text-gray-400">admin / admin123</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>Built with Next.js, Tailwind CSS, Framer Motion & JSON Server</p>
        </div>
      </footer>
    </div>
  );
}
