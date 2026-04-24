"use client";

import { useAuth } from "@/components/AuthProvider";
import ThemeToggle from "@/components/ThemeToggle";
import {
  createResult,
  deleteResult,
  getResults,
  getUsers,
  updateResult,
} from "@/lib/api";
import { Result, User } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FiBarChart2,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiFileText,
  FiLogOut,
  FiMenu,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiUpload,
  FiUser,
  FiX,
} from "react-icons/fi";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_COLORS = [
  "#8b5cf6",
  "#06b6d4",
  "#f59e0b",
  "#ec4899",
  "#10b981",
  "#f97316",
];

export default function TeacherDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState<User[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingResult, setEditingResult] = useState<Result | null>(null);
  const [expandedTask, setExpandedTask] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Multi-select states for modal
  const [modalStudentSearch, setModalStudentSearch] = useState("");
  const [selectedStudentsForTask, setSelectedStudentsForTask] = useState<
    Set<number>
  >(new Set());

  const [newTask, setNewTask] = useState({
    taskName: "",
    marks: 0,
    totalMarks: 100,
    status: "completed" as "completed" | "pending" | "notcompleted",
    locked: true,
    screenshot: "",
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== "teacher")) router.push("/login");
  }, [user, loading, router]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const studs = await getUsers("student");
      setStudents(studs);
      if (selectedStudent) {
        const res = await getResults({
          studentId: selectedStudent.id,
          subject: user.subject,
        });
        setResults(res);
      }
    } catch {
      toast.error("Failed to fetch data");
    }
  }, [user, selectedStudent]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectStudent = async (student: User) => {
    setSelectedStudent(student);
    if (user) {
      try {
        const res = await getResults({
          studentId: student.id,
          subject: user.subject,
        });
        setResults(res);
      } catch {
        toast.error("Failed to fetch results");
      }
    }
  };

  const toggleStudentInModal = (studentId: number) => {
    setSelectedStudentsForTask((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) newSet.delete(studentId);
      else newSet.add(studentId);
      return newSet;
    });
  };

  const handleAddTask = async () => {
    if (!user || !newTask.taskName.trim()) {
      toast.error("Please fill in task name");
      return;
    }
    if (selectedStudentsForTask.size === 0) {
      toast.error("Please select at least one student");
      return;
    }

    setIsLoading(true);
    try {
      // Fetch current max ID to avoid collisions in the loop
      const currentResults = await getResults();
      let nextId =
        currentResults.length > 0
          ? Math.max(...currentResults.map((r) => r.id)) + 1
          : 1;

      const promises = [];
      for (const studentId of selectedStudentsForTask) {
        promises.push(
          createResult({
            id: nextId++,
            studentId: studentId,
            teacherId: user.id,
            subject: user.subject,
            taskName: newTask.taskName,
            marks: Number(newTask.marks),
            totalMarks: Number(newTask.totalMarks),
            status: newTask.status,
            locked: newTask.locked,
            screenshot: newTask.screenshot,
            studentSubmission: "",
            submissionType: "",
            createdAt: new Date().toISOString().split("T")[0],
          }),
        );
      }
      await Promise.all(promises);

      toast.success(
        `Task assigned to ${selectedStudentsForTask.size} students!`,
      );
      setShowAddModal(false);
      setNewTask({
        taskName: "",
        marks: 0,
        totalMarks: 100,
        status: "completed",
        locked: true,
        screenshot: "",
      });
      setSelectedStudentsForTask(new Set());
      setModalStudentSearch("");
      fetchData();
    } catch {
      toast.error("Failed to create task");
    }
    setIsLoading(false);
  };

  const handleUpdateTask = async () => {
    if (!editingResult) return;
    try {
      await updateResult(editingResult.id, editingResult);
      toast.success("Task updated!");
      setEditingResult(null);
      fetchData();
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!confirm("Delete this task?")) return;
    try {
      await deleteResult(id);
      toast.success("Task deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleScreenshotUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit: boolean,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      if (isEdit && editingResult) {
        setEditingResult({ ...editingResult, screenshot: base64 });
      } else {
        setNewTask({ ...newTask, screenshot: base64 });
      }
    };
    reader.readAsDataURL(file);
  };

  const getGrade = (pct: number) => {
    if (pct >= 90) return { grade: "A+", color: "text-emerald-400" };
    if (pct >= 80) return { grade: "A", color: "text-emerald-400" };
    if (pct >= 70) return { grade: "B", color: "text-cyan-400" };
    if (pct >= 60) return { grade: "C", color: "text-amber-400" };
    if (pct >= 50) return { grade: "D", color: "text-orange-400" };
    return { grade: "F", color: "text-red-400" };
  };

  const avgPct =
    results.length > 0
      ? Math.round(
          results.reduce((s, r) => s + (r.marks / r.totalMarks) * 100, 0) /
            results.length,
        )
      : 0;

  const chartData = results.map((r) => ({
    name:
      r.taskName.length > 12 ? r.taskName.substring(0, 12) + "…" : r.taskName,
    marks: r.marks,
    total: r.totalMarks,
    pct: Math.round((r.marks / r.totalMarks) * 100),
  }));

  const statusData = [
    {
      name: "Completed",
      value: results.filter((r) => r.status === "completed").length,
      color: "#10b981",
    },
    {
      name: "Pending",
      value: results.filter((r) => r.status === "pending").length,
      color: "#f59e0b",
    },
    {
      name: "Incomplete",
      value: results.filter((r) => r.status === "notcompleted").length,
      color: "#ef4444",
    },
  ].filter((d) => d.value > 0);

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredModalStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(modalStudentSearch.toLowerCase()) ||
      s.username.toLowerCase().includes(modalStudentSearch.toLowerCase()),
  );

  if (loading || !user)
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen animated-bg flex overflow-hidden">
      {/* Sidebar Toggle Button (Floating when closed) */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-6 left-6 z-50 p-3 rounded-xl bg-violet-600 text-white shadow-lg hover:scale-110 transition-transform"
        >
          <FiMenu size={20} />
        </button>
      )}

      {/* Sidebar */}
      <motion.aside
        className="glass-strong border-r border-slate-200 dark:border-white/5 flex flex-col h-screen sticky top-0 z-40"
        // initial={{ x: -320 }}
        initial={false}
        animate={{
          width: isSidebarOpen ? 340 : 0,
          x: isSidebarOpen ? 0 : -340,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="p-6 border-b border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-lg">
              {user.avatar || "👨‍🏫"}
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">
                {user.name}
              </h2>
              <p className="text-xs text-violet-400">{user.subject} Teacher</p>
            </div>
            <ThemeToggle />
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg text-slate-500"
            >
              <FiChevronLeft size={20} />
            </button>
          </div>
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400 hover:text-red-400 transition-colors"
          >
            <FiLogOut /> Sign Out
          </button>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm placeholder-gray-500 focus:border-violet-500"
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-500 mb-2 px-2">
            STUDENTS ({filteredStudents.length})
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          {filteredStudents.map((s, i) => (
            <motion.button
              key={s.id}
              onClick={() => handleSelectStudent(s)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 mb-1 ${
                selectedStudent?.id === s.id
                  ? "bg-violet-600/20 border border-violet-500/30 text-slate-900 dark:text-white"
                  : "hover:bg-white/50 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white"
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center text-lg">
                {s.avatar || "👤"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{s.name}</p>
                <p className="text-xs text-slate-500 dark:text-gray-500">
                  @{s.username}
                </p>
              </div>
              <FiChevronRight className="text-gray-600" />
            </motion.button>
          ))}
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          {!selectedStudent ? (
            <motion.div
              key="empty"
              className="flex flex-col items-center justify-center h-full text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="text-6xl mb-4">📐</div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Select a Student
              </h2>
              <p className="text-slate-600 dark:text-gray-400 mb-8">
                Choose a student from the sidebar to view their {user.subject}{" "}
                results
              </p>
              <motion.button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-slate-900 dark:text-white font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiPlus /> Or Assign Task to Multiple Students
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key={selectedStudent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-2xl">
                    {selectedStudent.avatar || "👤"}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {selectedStudent.name}
                    </h1>
                    <p className="text-slate-600 dark:text-gray-400">
                      {user.subject} — {results.length} tasks
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-slate-900 dark:text-white font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiPlus /> New Task
                </motion.button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[
                  {
                    label: "Average",
                    value: `${avgPct}%`,
                    icon: <FiBarChart2 />,
                    color: "from-violet-500 to-purple-600",
                  },
                  {
                    label: "Grade",
                    value: getGrade(avgPct).grade,
                    icon: <FiUser />,
                    color: "from-cyan-500 to-teal-600",
                  },
                  {
                    label: "Completed",
                    value: results.filter((r) => r.status === "completed")
                      .length,
                    icon: <FiCheck />,
                    color: "from-emerald-500 to-green-600",
                  },
                  {
                    label: "Pending",
                    value: results.filter((r) => r.status !== "completed")
                      .length,
                    icon: <FiFileText />,
                    color: "from-amber-500 to-orange-600",
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    className="glass rounded-2xl p-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{
                      y: -4,
                      boxShadow: "0 10px 30px rgba(139,92,246,0.15)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-slate-500 dark:text-gray-500 uppercase tracking-wider">
                        {stat.label}
                      </span>
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-slate-900 dark:text-white text-sm`}
                      >
                        {stat.icon}
                      </div>
                    </div>
                    <p
                      className={`text-2xl font-bold ${stat.label === "Grade" ? getGrade(avgPct).color : "text-slate-900 dark:text-white"}`}
                    >
                      {stat.value}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <motion.div
                  className="glass rounded-2xl p-6 lg:col-span-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                    Performance Trend
                  </h3>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={chartData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.05)"
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "#9ca3af", fontSize: 11 }}
                        />
                        <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{
                            background: "#1e1b4b",
                            border: "1px solid rgba(139,92,246,0.3)",
                            borderRadius: "12px",
                            color: "#e2e8f0",
                          }}
                        />
                        <Bar
                          dataKey="marks"
                          fill="#8b5cf6"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="total"
                          fill="#1e1b4b"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-slate-500 dark:text-gray-500">
                      No data yet
                    </div>
                  )}
                </motion.div>

                <motion.div
                  className="glass rounded-2xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                    Status Breakdown
                  </h3>
                  {statusData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
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
                              border: "1px solid rgba(139,92,246,0.3)",
                              borderRadius: "12px",
                              color: "#e2e8f0",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-wrap gap-3 mt-2">
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
                    <div className="h-[200px] flex items-center justify-center text-slate-500 dark:text-gray-500">
                      No data
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Task List */}
              <motion.div
                className="glass rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  {user.subject} Tasks ({results.length})
                </h3>
                <div className="space-y-3">
                  {results.map((r, i) => {
                    const pct = Math.round((r.marks / r.totalMarks) * 100);
                    const g = getGrade(pct);
                    const isExpanded = expandedTask === r.id;
                    return (
                      <motion.div
                        key={r.id}
                        className={`rounded-xl border transition-all duration-300 ${
                          isExpanded
                            ? "border-violet-500/30 bg-violet-500/5"
                            : "border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] hover:bg-white/50 dark:bg-white/5"
                        }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <button
                          onClick={() =>
                            setExpandedTask(isExpanded ? null : r.id)
                          }
                          className="w-full flex items-center gap-4 p-4 text-left"
                        >
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                              r.status === "completed"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : r.status === "pending"
                                  ? "bg-amber-500/20 text-amber-400"
                                  : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {r.status === "completed" ? (
                              <FiCheck />
                            ) : r.status === "pending" ? (
                              "⏳"
                            ) : (
                              <FiX />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-white truncate">
                              {r.taskName}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-gray-500">
                              {r.createdAt}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${g.color}`}>
                              {r.marks}/{r.totalMarks}
                            </p>
                            <p className={`text-xs ${g.color}`}>
                              {g.grade} ({pct}%)
                            </p>
                          </div>
                          <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}>
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
                              <div className="px-4 pb-4 border-t border-slate-200 dark:border-white/5 pt-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                  <div>
                                    <p className="text-xs text-slate-500 dark:text-gray-500 mb-1">
                                      Status
                                    </p>
                                    <span
                                      className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                                        r.status === "completed"
                                          ? "bg-emerald-500/20 text-emerald-400"
                                          : r.status === "pending"
                                            ? "bg-amber-500/20 text-amber-400"
                                            : "bg-red-500/20 text-red-400"
                                      }`}
                                    >
                                      {r.status}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500 dark:text-gray-500 mb-1">
                                      Locked
                                    </p>
                                    <span
                                      className={`text-xs font-semibold ${r.locked ? "text-red-400" : "text-emerald-400"}`}
                                    >
                                      {r.locked ? "🔒 Yes" : "🔓 No"}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500 dark:text-gray-500 mb-1">
                                      Percentage
                                    </p>
                                    <div className="w-full h-2 rounded-full bg-white/10 mt-1.5">
                                      <div
                                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500 dark:text-gray-500 mb-1">
                                      Submission
                                    </p>
                                    <p className="text-xs text-gray-300 truncate">
                                      {r.studentSubmission || "None"}
                                    </p>
                                  </div>
                                </div>

                                {r.screenshot && (
                                  <div className="mb-4">
                                    <p className="text-xs text-slate-500 dark:text-gray-500 mb-2">
                                      Screenshot
                                    </p>
                                    <img
                                      src={r.screenshot}
                                      alt="screenshot"
                                      className="max-w-xs rounded-xl border border-slate-200 dark:border-white/10"
                                    />
                                  </div>
                                )}

                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setEditingResult({ ...r })}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/20 text-violet-400 text-xs font-semibold hover:bg-violet-500/30 transition"
                                  >
                                    <FiEdit2 /> Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTask(r.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/30 transition"
                                  >
                                    <FiTrash2 /> Delete
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                  {results.length === 0 && (
                    <div className="text-center py-8 text-slate-500 dark:text-gray-500">
                      No tasks yet. Click &quot;New Task&quot; to create one.
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ===== ADD TASK MODAL (With Multi-Select) ===== */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowAddModal(false);
              setSelectedStudentsForTask(new Set());
              setModalStudentSearch("");
            }}
          >
            <motion.div
              className="glass-strong rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                New {user?.subject} Task
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Task Details */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-600 dark:text-gray-400 mb-1 block">
                      Task Name *
                    </label>
                    <input
                      type="text"
                      value={newTask.taskName}
                      onChange={(e) =>
                        setNewTask({ ...newTask, taskName: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-gray-500 focus:border-violet-500"
                      placeholder="e.g. Algebra Quiz 2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-600 dark:text-gray-400 mb-1 block">
                        Marks Obtained
                      </label>
                      <input
                        type="number"
                        value={newTask.marks}
                        onChange={(e) =>
                          setNewTask({
                            ...newTask,
                            marks: Number(e.target.value),
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-violet-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600 dark:text-gray-400 mb-1 block">
                        Total Marks
                      </label>
                      <input
                        type="number"
                        value={newTask.totalMarks}
                        onChange={(e) =>
                          setNewTask({
                            ...newTask,
                            totalMarks: Number(e.target.value),
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-violet-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-600 dark:text-gray-400 mb-1 block">
                        Status
                      </label>
                      <select
                        value={newTask.status}
                        onChange={(e) =>
                          setNewTask({
                            ...newTask,
                            status: e.target.value as
                              | "completed"
                              | "pending"
                              | "notcompleted",
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-violet-500"
                      >
                        <option value="completed" className="bg-gray-900">
                          Completed
                        </option>
                        <option value="pending" className="bg-gray-900">
                          Pending
                        </option>
                        <option value="notcompleted" className="bg-gray-900">
                          Not Completed
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600 dark:text-gray-400 mb-1 block">
                        Lock Student Edits
                      </label>
                      <button
                        onClick={() =>
                          setNewTask({ ...newTask, locked: !newTask.locked })
                        }
                        className={`w-full px-4 py-3 rounded-xl border font-semibold transition ${
                          newTask.locked
                            ? "bg-red-500/20 border-red-500/30 text-red-400"
                            : "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                        }`}
                      >
                        {newTask.locked ? "🔒 Locked" : "🔓 Unlocked"}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 dark:text-gray-400 mb-1 block">
                      Screenshot (optional)
                    </label>
                    <label className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 cursor-pointer hover:border-violet-500 transition">
                      <FiUpload />
                      <span className="text-sm">Upload Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleScreenshotUpload(e, false)}
                      />
                    </label>
                    {newTask.screenshot && (
                      <img
                        src={newTask.screenshot}
                        alt="preview"
                        className="mt-2 max-w-xs rounded-xl border border-slate-200 dark:border-white/10 h-24 object-cover"
                      />
                    )}
                  </div>
                </div>

                {/* Right Column - Student Multi-Select */}
                <div className="flex flex-col">
                  <label className="text-sm text-slate-600 dark:text-gray-400 mb-2 block">
                    Assign to Students *
                    <span className="text-violet-400 ml-2">
                      ({selectedStudentsForTask.size} selected)
                    </span>
                  </label>

                  {/* Search inside modal */}
                  <div className="relative mb-3">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-gray-500" />
                    <input
                      type="text"
                      value={modalStudentSearch}
                      onChange={(e) => setModalStudentSearch(e.target.value)}
                      placeholder="Search students..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm placeholder-gray-500 focus:border-violet-500"
                    />
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => {
                        const allIds = new Set(
                          filteredModalStudents.map((s) => s.id),
                        );
                        setSelectedStudentsForTask(allIds);
                      }}
                      className="flex-1 text-xs py-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-white/50 dark:bg-white/5 transition"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => setSelectedStudentsForTask(new Set())}
                      className="flex-1 text-xs py-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-white/50 dark:bg-white/5 transition"
                    >
                      Clear All
                    </button>
                  </div>

                  {/* Student List Checkboxes */}
                  <div className="flex-1 overflow-y-auto max-h-[45vh] space-y-1 pr-1 custom-scrollbar">
                    {filteredModalStudents.map((student) => (
                      <motion.label
                        key={student.id}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                          selectedStudentsForTask.has(student.id)
                            ? "bg-violet-600/20 border border-violet-500/30"
                            : "border border-transparent hover:bg-white/50 dark:bg-white/5"
                        }`}
                        whileTap={{ scale: 0.98 }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudentsForTask.has(student.id)}
                          onChange={() => toggleStudentInModal(student.id)}
                          className="w-4 h-4 rounded border-gray-600 text-violet-500 focus:ring-violet-500 bg-white/10 cursor-pointer"
                        />
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center text-sm">
                          {student.avatar || "👤"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {student.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-gray-500">
                            @{student.username}
                          </p>
                        </div>
                        {selectedStudentsForTask.has(student.id) && (
                          <FiCheck className="text-violet-400 flex-shrink-0" />
                        )}
                      </motion.label>
                    ))}
                    {filteredModalStudents.length === 0 && (
                      <p className="text-sm text-slate-500 dark:text-gray-500 text-center py-4">
                        No students found
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-white/5">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedStudentsForTask(new Set());
                    setModalStudentSearch("");
                  }}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 font-semibold hover:bg-white/50 dark:bg-white/5 transition"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleAddTask}
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-slate-900 dark:text-white font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    `Assign to ${selectedStudentsForTask.size || 0} Student(s)`
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Task Modal */}
      <AnimatePresence>
        {editingResult && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditingResult(null)}
          >
            <motion.div
              className="glass-strong rounded-3xl p-8 w-full max-w-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                Edit Task
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-600 dark:text-gray-400 mb-1 block">
                    Task Name
                  </label>
                  <input
                    type="text"
                    value={editingResult.taskName}
                    onChange={(e) =>
                      setEditingResult({
                        ...editingResult,
                        taskName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-violet-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-600 dark:text-gray-400 mb-1 block">
                      Marks
                    </label>
                    <input
                      type="number"
                      value={editingResult.marks}
                      onChange={(e) =>
                        setEditingResult({
                          ...editingResult,
                          marks: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 dark:text-gray-400 mb-1 block">
                      Total Marks
                    </label>
                    <input
                      type="number"
                      value={editingResult.totalMarks}
                      onChange={(e) =>
                        setEditingResult({
                          ...editingResult,
                          totalMarks: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-violet-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-600 dark:text-gray-400 mb-1 block">
                      Status
                    </label>
                    <select
                      value={editingResult.status}
                      onChange={(e) =>
                        setEditingResult({
                          ...editingResult,
                          status: e.target.value as
                            | "completed"
                            | "pending"
                            | "notcompleted",
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-violet-500"
                    >
                      <option value="completed" className="bg-gray-900">
                        Completed
                      </option>
                      <option value="pending" className="bg-gray-900">
                        Pending
                      </option>
                      <option value="notcompleted" className="bg-gray-900">
                        Not Completed
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 dark:text-gray-400 mb-1 block">
                      Lock Student Edits
                    </label>
                    <button
                      onClick={() =>
                        setEditingResult({
                          ...editingResult,
                          locked: !editingResult.locked,
                        })
                      }
                      className={`w-full px-4 py-3 rounded-xl border font-semibold transition ${
                        editingResult.locked
                          ? "bg-red-500/20 border-red-500/30 text-red-400"
                          : "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                      }`}
                    >
                      {editingResult.locked ? "🔒 Locked" : "🔓 Unlocked"}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-600 dark:text-gray-400 mb-1 block">
                    Screenshot
                  </label>
                  <label className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 cursor-pointer hover:border-violet-500 transition">
                    <FiUpload />
                    <span className="text-sm">Change Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleScreenshotUpload(e, true)}
                    />
                  </label>
                  {editingResult.screenshot && (
                    <img
                      src={editingResult.screenshot}
                      alt="preview"
                      className="mt-2 max-w-xs rounded-xl border border-slate-200 dark:border-white/10"
                    />
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingResult(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 font-semibold hover:bg-white/50 dark:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateTask}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-slate-900 dark:text-white font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
