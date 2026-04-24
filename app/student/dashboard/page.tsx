"use client";

import { useAuth } from "@/components/AuthProvider";
import MonsterMascot from "@/components/MonsterMascot";
import ThemeToggle from "@/components/ThemeToggle";
import { getResults, updateResult } from "@/lib/api";
import { Result } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FiAward,
  FiBookOpen,
  FiCheck,
  FiChevronRight,
  FiEdit3,
  FiFileText,
  FiImage,
  FiLogOut,
  FiTarget,
  FiUpload,
} from "react-icons/fi";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const SUBJECT_EMOJIS: Record<string, string> = {
  Math: "📐",
  Science: "🔬",
  English: "📚",
  History: "🏛️",
  Art: "🎨",
};

const CHART_COLORS = [
  "#8b5cf6",
  "#06b6d4",
  "#f59e0b",
  "#ec4899",
  "#10b981",
  "#f97316",
];

function getGrade(pct: number) {
  if (pct >= 90) return { grade: "A+", color: "text-emerald-400", emoji: "🏆" };
  if (pct >= 80) return { grade: "A", color: "text-emerald-400", emoji: "🌟" };
  if (pct >= 70) return { grade: "B", color: "text-cyan-400", emoji: "👏" };
  if (pct >= 60) return { grade: "C", color: "text-amber-400", emoji: "💪" };
  if (pct >= 50) return { grade: "D", color: "text-orange-400", emoji: "📈" };
  return { grade: "F", color: "text-red-400", emoji: "📚" };
}

export default function StudentDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [results, setResults] = useState<Result[]>([]);
  const [selectedTask, setSelectedTask] = useState<Result | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submittingTask, setSubmittingTask] = useState<Result | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionFile, setSubmissionFile] = useState<string>("");
  const [submissionType, setSubmissionType] = useState<"text" | "jpg" | "pdf">(
    "text",
  );
  const [confetti, setConfetti] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "tasks">("overview");

  useEffect(() => {
    if (!loading && (!user || user.role !== "student")) router.push("/login");
  }, [user, loading, router]);

  const fetchResults = useCallback(async () => {
    if (!user) return;
    try {
      const res = await getResults({ studentId: user.id });
      setResults(res);
    } catch {
      toast.error("Failed to load results");
    }
  }, [user]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Derived data
  const completedTasks = results.filter((r) => r.status === "completed");
  const pendingTasks = results.filter((r) => r.status === "pending");
  const notCompletedTasks = results.filter((r) => r.status === "notcompleted");
  const remainingTasks = [...pendingTasks, ...notCompletedTasks];

  const overallAvg =
    completedTasks.length > 0
      ? Math.round(
          completedTasks.reduce(
            (s, r) => s + (r.marks / r.totalMarks) * 100,
            0,
          ) / completedTasks.length,
        )
      : 0;

  const gradeInfo = getGrade(overallAvg);

  // Subject-wise averages for radar chart
  const subjectMap = new Map<string, { total: number; count: number }>();
  completedTasks.forEach((r) => {
    const cur = subjectMap.get(r.subject) || { total: 0, count: 0 };
    cur.total += (r.marks / r.totalMarks) * 100;
    cur.count += 1;
    subjectMap.set(r.subject, cur);
  });
  const radarData = Array.from(subjectMap.entries()).map(
    ([subject, { total, count }]) => ({
      subject,
      score: Math.round(total / count),
      fullMark: 100,
    }),
  );

  // Performance trend
  const trendData = results
    .filter((r) => r.status === "completed")
    .map((r) => ({
      name:
        r.taskName.length > 10 ? r.taskName.substring(0, 10) + "…" : r.taskName,
      percentage: Math.round((r.marks / r.totalMarks) * 100),
    }));

  // Status pie data
  const statusData = [
    { name: "Completed", value: completedTasks.length, color: "#10b981" },
    { name: "Pending", value: pendingTasks.length, color: "#f59e0b" },
    { name: "Incomplete", value: notCompletedTasks.length, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  const handleOpenSubmit = (task: Result) => {
    if (task.locked) {
      toast.error("This task is locked by the teacher");
      return;
    }
    setSubmittingTask(task);
    setSubmissionText(task.studentSubmission || "");
    setSubmissionFile("");
    setSubmissionType("text");
    setShowSubmitModal(true);
  };

  const handleSubmitTask = async () => {
    if (!submittingTask) return;
    if (submissionType === "text" && !submissionText.trim()) {
      toast.error("Please type your submission");
      return;
    }
    if (
      (submissionType === "jpg" || submissionType === "pdf") &&
      !submissionFile
    ) {
      toast.error("Please upload a file");
      return;
    }
    try {
      await updateResult(submittingTask.id, {
        ...submittingTask,
        studentSubmission:
          submissionType === "text" ? submissionText : submissionFile,
        submissionType,
        status: "completed",
      });
      toast.success("Task submitted! 🎉");
      setShowSubmitModal(false);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 3000);
      fetchResults();
    } catch {
      toast.error("Failed to submit");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSubmissionFile(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (loading || !user)
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen animated-bg relative overflow-hidden">
      {/* Confetti */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-[100]">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                background: CHART_COLORS[i % CHART_COLORS.length],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                width: `${6 + Math.random() * 8}px`,
                height: `${6 + Math.random() * 8}px`,
              }}
            />
          ))}
        </div>
      )}

      {/* Top Navbar */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 glass"
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-slate-900 dark:text-white font-bold">
              R
            </div>
            <span className="text-lg font-bold gradient-text">
              Unilife Learning
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-2 glass rounded-xl px-4 py-2">
              <span className="text-lg">{user.avatar || "👤"}</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {user.name}
              </span>
            </div>
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

      {/* Main Content */}
      <div className="pt-20 pb-10 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Welcome Section with Monster */}
        <motion.div
          className="flex flex-col md:flex-row items-center gap-8 mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex-shrink-0">
            <MonsterMascot size={140} color="teal" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black mb-2">
              <span className="gradient-text">
                Hey {user.name.split(" ")[0]}!
              </span>
            </h1>
            <p className="text-slate-600 dark:text-gray-400 text-lg mb-4">
              Ready to check your results? Let&apos;s see how you&apos;re doing!
              ✨
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all ${
                  activeTab === "overview"
                    ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-slate-900 dark:text-white shadow-lg shadow-teal-500/25"
                    : "glass text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white"
                }`}
              >
                📊 Overview
              </button>
              <button
                onClick={() => setActiveTab("tasks")}
                className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all ${
                  activeTab === "tasks"
                    ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-slate-900 dark:text-white shadow-lg shadow-teal-500/25"
                    : "glass text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white"
                }`}
              >
                📝 My Tasks
              </button>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "overview" ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  {
                    label: "Overall Score",
                    value: `${overallAvg}%`,
                    icon: <FiTarget />,
                    gradient: "from-teal-500 to-cyan-600",
                    big: true,
                  },
                  {
                    label: "Grade",
                    value: gradeInfo.grade,
                    icon: <FiAward />,
                    gradient: "from-violet-500 to-purple-600",
                    big: true,
                  },
                  {
                    label: "Tasks Done",
                    value: `${completedTasks.length}/${results.length}`,
                    icon: <FiCheck />,
                    gradient: "from-emerald-500 to-green-600",
                    big: false,
                  },
                  {
                    label: "Remaining",
                    value: remainingTasks.length,
                    icon: <FiBookOpen />,
                    gradient: "from-amber-500 to-orange-600",
                    big: false,
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    className="glass rounded-2xl p-5 relative overflow-hidden group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                      <div
                        className={`w-full h-full rounded-full bg-gradient-to-br ${stat.gradient} blur-xl`}
                      />
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-slate-500 dark:text-gray-500 uppercase tracking-wider">
                        {stat.label}
                      </span>
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-slate-900 dark:text-white text-sm`}
                      >
                        {stat.icon}
                      </div>
                    </div>
                    <p
                      className={`${stat.big ? "text-3xl" : "text-2xl"} font-bold ${
                        stat.label === "Grade"
                          ? gradeInfo.color
                          : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {stat.value}
                    </p>
                    {stat.label === "Overall Score" && (
                      <div className="w-full h-2 rounded-full bg-white/10 mt-2">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${overallAvg}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    )}
                    {stat.label === "Grade" && (
                      <p className="text-2xl mt-1">{gradeInfo.emoji}</p>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Bar Chart */}
                <motion.div
                  className="glass rounded-2xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                    📈 Performance Trend
                  </h3>
                  {trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={trendData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.05)"
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "#9ca3af", fontSize: 10 }}
                        />
                        <YAxis
                          tick={{ fill: "#9ca3af", fontSize: 11 }}
                          domain={[0, 100]}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "#1e1b4b",
                            border: "1px solid rgba(20,184,166,0.3)",
                            borderRadius: "12px",
                            color: "#e2e8f0",
                          }}
                        />
                        <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                          {trendData.map((_, i) => (
                            <Cell
                              key={i}
                              fill={CHART_COLORS[i % CHART_COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[260px] flex items-center justify-center text-slate-500 dark:text-gray-500">
                      Complete some tasks to see your trend! 📊
                    </div>
                  )}
                </motion.div>

                {/* Radar Chart */}
                <motion.div
                  className="glass rounded-2xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                    🎯 Subject Radar
                  </h3>
                  {radarData.length > 1 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{ fill: "#9ca3af", fontSize: 12 }}
                        />
                        <PolarRadiusAxis
                          angle={30}
                          domain={[0, 100]}
                          tick={{ fill: "#6b7280", fontSize: 10 }}
                        />
                        <Radar
                          name="Score"
                          dataKey="score"
                          stroke="#14b8a6"
                          fill="#14b8a6"
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[260px] flex flex-col items-center justify-center text-slate-500 dark:text-gray-500">
                      <p>Need results in multiple subjects</p>
                      <p className="text-sm">
                        for the radar chart to appear 🎯
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Status Pie + Subject Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <motion.div
                  className="glass rounded-2xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                    📊 Task Status
                  </h3>
                  {statusData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={75}
                            dataKey="value"
                            paddingAngle={4}
                          >
                            {statusData.map((d, i) => (
                              <Cell key={i} fill={d.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              background: "#1e1b4b",
                              border: "1px solid rgba(20,184,166,0.3)",
                              borderRadius: "12px",
                              color: "#e2e8f0",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-wrap gap-3 mt-2 justify-center">
                        {statusData.map((d, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-gray-400"
                          >
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ background: d.color }}
                            />
                            {d.name}: {d.value}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="h-[220px] flex items-center justify-center text-slate-500 dark:text-gray-500">
                      No tasks yet
                    </div>
                  )}
                </motion.div>

                {/* Subject Cards */}
                <motion.div
                  className="lg:col-span-2 glass rounded-2xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                    📚 Subject Breakdown
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Array.from(subjectMap.entries()).map(
                      ([subject, { total, count }]) => {
                        const avg = Math.round(total / count);
                        const g = getGrade(avg);
                        return (
                          <motion.div
                            key={subject}
                            className="glass rounded-xl p-4 text-center group cursor-pointer hover:bg-white/[0.06] transition"
                            whileHover={{ y: -4, scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setActiveTab("tasks")}
                          >
                            <div className="text-3xl mb-2">
                              {SUBJECT_EMOJIS[subject] || "📖"}
                            </div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                              {subject}
                            </p>
                            <p className={`text-xl font-black ${g.color}`}>
                              {avg}%
                            </p>
                            <p className={`text-xs font-semibold ${g.color}`}>
                              {g.grade}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                              {count} tasks
                            </p>
                          </motion.div>
                        );
                      },
                    )}
                    {subjectMap.size === 0 && (
                      <div className="col-span-full py-8 text-center text-slate-500 dark:text-gray-500">
                        No completed tasks yet. Start submitting! 🚀
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            /* ==================== TASKS TAB ==================== */
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Remaining Tasks */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-amber-400">⏳</span> Remaining Tasks (
                  {remainingTasks.length})
                </h2>
                {remainingTasks.length === 0 ? (
                  <div className="glass rounded-2xl p-8 text-center">
                    <p className="text-4xl mb-3">🎉</p>
                    <p className="text-slate-600 dark:text-gray-400">
                      All tasks completed! Great job!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {remainingTasks.map((task, i) => {
                      const isNotCompleted = task.status === "notcompleted";
                      return (
                        <motion.div
                          key={task.id}
                          className="glass rounded-2xl p-5 group cursor-pointer"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08 }}
                          whileHover={{ y: -4, scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleOpenSubmit(task)}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                                isNotCompleted
                                  ? "bg-red-500/20"
                                  : "bg-amber-500/20"
                              }`}
                            >
                              {isNotCompleted ? "📝" : "⏳"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white truncate">
                                {task.taskName}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-500 dark:text-gray-500 flex items-center gap-1">
                                  {SUBJECT_EMOJIS[task.subject] || "📖"}{" "}
                                  {task.subject}
                                </span>
                                <span className="text-xs text-gray-600">•</span>
                                <span className="text-xs text-slate-500 dark:text-gray-500">
                                  {task.totalMarks} marks
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <span
                                  className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                                    isNotCompleted
                                      ? "bg-red-500/20 text-red-400"
                                      : "bg-amber-500/20 text-amber-400"
                                  }`}
                                >
                                  {isNotCompleted ? "Incomplete" : "Pending"}
                                </span>
                                {task.locked ? (
                                  <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400">
                                    🔒 Locked
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400">
                                    🔓 Can Submit
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <FiChevronRight className="text-gray-600 group-hover:text-teal-400 transition" />
                              {!task.locked && (
                                <motion.span
                                  className="text-xs text-teal-400 font-semibold"
                                  animate={{ opacity: [0.5, 1, 0.5] }}
                                  transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                  }}
                                >
                                  Submit →
                                </motion.span>
                              )}
                            </div>
                          </div>
                          {task.studentSubmission && (
                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/5">
                              <p className="text-xs text-slate-500 dark:text-gray-500">
                                Your submission:
                              </p>
                              <p className="text-xs text-gray-300 truncate">
                                {task.studentSubmission}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>

              {/* Completed Tasks */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-emerald-400">✅</span> Completed Tasks (
                  {completedTasks.length})
                </h2>
                {completedTasks.length === 0 ? (
                  <div className="glass rounded-2xl p-8 text-center">
                    <p className="text-4xl mb-3">📚</p>
                    <p className="text-slate-600 dark:text-gray-400">
                      No completed tasks yet. Submit your work!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {completedTasks.map((task, i) => {
                      const pct = Math.round(
                        (task.marks / task.totalMarks) * 100,
                      );
                      const g = getGrade(pct);
                      const isExpanded = selectedTask?.id === task.id;
                      return (
                        <motion.div
                          key={task.id}
                          className={`glass rounded-2xl overflow-hidden transition-all duration-300 ${
                            isExpanded ? "ring-1 ring-teal-500/30" : ""
                          }`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <button
                            onClick={() =>
                              setSelectedTask(isExpanded ? null : task)
                            }
                            className="w-full flex items-center gap-4 p-5 text-left"
                          >
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-xl">
                              {g.emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white truncate">
                                {task.taskName}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-500 dark:text-gray-500 flex items-center gap-1">
                                  {SUBJECT_EMOJIS[task.subject] || "📖"}{" "}
                                  {task.subject}
                                </span>
                                <span className="text-xs text-gray-600">•</span>
                                <span className="text-xs text-slate-500 dark:text-gray-500">
                                  {task.createdAt}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-black text-slate-900 dark:text-white">
                                {task.marks}
                                <span className="text-sm text-slate-500 dark:text-gray-500">
                                  /{task.totalMarks}
                                </span>
                              </p>
                              <p className={`text-sm font-bold ${g.color}`}>
                                {g.grade} ({pct}%)
                              </p>
                            </div>
                            <motion.div
                              animate={{ rotate: isExpanded ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <FiChevronRight className="text-slate-500 dark:text-gray-500" />
                            </motion.div>
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="px-5 pb-5 border-t border-slate-200 dark:border-white/5 pt-4">
                                  {/* Progress bar */}
                                  <div className="mb-4">
                                    <div className="flex justify-between text-xs mb-1">
                                      <span className="text-slate-500 dark:text-gray-500">
                                        Score
                                      </span>
                                      <span
                                        className={`font-semibold ${g.color}`}
                                      >
                                        {pct}%
                                      </span>
                                    </div>
                                    <div className="w-full h-3 rounded-full bg-white/10">
                                      <motion.div
                                        className={`h-full rounded-full ${
                                          pct >= 70
                                            ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                                            : pct >= 50
                                              ? "bg-gradient-to-r from-amber-500 to-orange-500"
                                              : "bg-gradient-to-r from-red-500 to-rose-500"
                                        }`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${pct}%` }}
                                        transition={{ duration: 0.8 }}
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <div>
                                      <p className="text-xs text-slate-500 dark:text-gray-500 mb-1">
                                        Marks
                                      </p>
                                      <p className="font-bold text-slate-900 dark:text-white">
                                        {task.marks}/{task.totalMarks}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-500 dark:text-gray-500 mb-1">
                                        Grade
                                      </p>
                                      <p className={`font-bold ${g.color}`}>
                                        {g.emoji} {g.grade}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-500 dark:text-gray-500 mb-1">
                                        Locked
                                      </p>
                                      <p
                                        className={`font-semibold text-sm ${task.locked ? "text-red-400" : "text-emerald-400"}`}
                                      >
                                        {task.locked ? "🔒 Yes" : "🔓 No"}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-500 dark:text-gray-500 mb-1">
                                        Submitted
                                      </p>
                                      <p className="text-sm text-gray-300">
                                        {task.studentSubmission ? "Yes" : "No"}
                                      </p>
                                    </div>
                                  </div>

                                  {task.studentSubmission && (
                                    <div className="mb-4">
                                      <p className="text-xs text-slate-500 dark:text-gray-500 mb-1">
                                        Your Submission
                                      </p>
                                      {task.submissionType === "jpg" ||
                                      task.submissionType === "pdf" ? (
                                        <img
                                          src={task.studentSubmission}
                                          alt="submission"
                                          className="max-w-xs rounded-xl border border-slate-200 dark:border-white/10"
                                        />
                                      ) : (
                                        <div className="glass rounded-xl p-3 text-sm text-gray-300">
                                          {task.studentSubmission}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {task.screenshot && (
                                    <div className="mb-4">
                                      <p className="text-xs text-slate-500 dark:text-gray-500 mb-1">
                                        Teacher Screenshot
                                      </p>
                                      <img
                                        src={task.screenshot}
                                        alt="result"
                                        className="max-w-xs rounded-xl border border-slate-200 dark:border-white/10"
                                      />
                                    </div>
                                  )}

                                  {!task.locked && (
                                    <motion.button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenSubmit(task);
                                      }}
                                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500/20 text-teal-400 text-sm font-semibold hover:bg-teal-500/30 transition"
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <FiEdit3 /> Edit Submission
                                    </motion.button>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Submit Task Modal */}
      <AnimatePresence>
        {showSubmitModal && submittingTask && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSubmitModal(false)}
          >
            <motion.div
              className="glass-strong rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-xl">
                  {SUBJECT_EMOJIS[submittingTask.subject] || "📖"}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Submit Task
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-gray-400">
                    {submittingTask.taskName} — {submittingTask.subject}
                  </p>
                </div>
              </div>

              {/* Submission type selector */}
              <div className="flex gap-2 mb-6">
                {[
                  {
                    type: "text" as const,
                    label: "✏️ Type",
                    icon: <FiEdit3 />,
                  },
                  {
                    type: "jpg" as const,
                    label: "🖼️ Image",
                    icon: <FiImage />,
                  },
                  {
                    type: "pdf" as const,
                    label: "📄 File",
                    icon: <FiFileText />,
                  },
                ].map((opt) => (
                  <button
                    key={opt.type}
                    onClick={() => setSubmissionType(opt.type)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition ${
                      submissionType === opt.type
                        ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                        : "glass text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white"
                    }`}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>

              {/* Text input */}
              {submissionType === "text" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <label className="text-sm text-slate-600 dark:text-gray-400 mb-2 block">
                    Type your answer
                  </label>
                  <textarea
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-gray-500 focus:border-teal-500 resize-none"
                    placeholder="Write your answer here..."
                  />
                </motion.div>
              )}

              {/* File upload */}
              {(submissionType === "jpg" || submissionType === "pdf") && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <label className="text-sm text-slate-600 dark:text-gray-400 mb-2 block">
                    Upload {submissionType === "jpg" ? "an image" : "a file"}
                  </label>
                  <label className="flex flex-col items-center gap-3 px-6 py-8 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-teal-500/50 cursor-pointer transition group">
                    <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 text-xl group-hover:scale-110 transition">
                      <FiUpload />
                    </div>
                    <span className="text-sm text-slate-600 dark:text-gray-400 group-hover:text-teal-400 transition">
                      Click to upload{" "}
                      {submissionType === "jpg" ? "(JPG, PNG)" : "(PDF, DOC)"}
                    </span>
                    <input
                      type="file"
                      accept={
                        submissionType === "jpg" ? "image/*" : ".pdf,.doc,.docx"
                      }
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                  {submissionFile && (
                    <div className="mt-3">
                      {submissionType === "jpg" ? (
                        <img
                          src={submissionFile}
                          alt="preview"
                          className="max-w-full rounded-xl border border-slate-200 dark:border-white/10"
                        />
                      ) : (
                        <div className="glass rounded-xl p-3 text-sm text-teal-400">
                          📄 File uploaded successfully
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 font-semibold hover:bg-white/50 dark:bg-white/5 transition"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleSubmitTask}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-slate-900 dark:text-white font-semibold hover:shadow-lg hover:shadow-teal-500/25 transition"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Submit 🚀
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
