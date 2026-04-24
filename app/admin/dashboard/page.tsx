"use client";

import { useAuth } from "@/components/AuthProvider";
import {
  createUser,
  deleteUser,
  getNextId,
  getResults,
  getUsers,
  updateUser,
} from "@/lib/api";
import { Result, User } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiBarChart2,
  FiCheck,
  FiChevronRight,
  FiEdit2,
  FiLogOut,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiUser,
  FiUsers,
  FiXCircle,
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

function getGrade(pct: number) {
  if (pct >= 90) return { grade: "A+", color: "text-emerald-400" };
  if (pct >= 80) return { grade: "A", color: "text-emerald-400" };
  if (pct >= 70) return { grade: "B", color: "text-cyan-400" };
  if (pct >= 60) return { grade: "C", color: "text-amber-400" };
  if (pct >= 50) return { grade: "D", color: "text-orange-400" };
  return { grade: "F", color: "text-red-400" };
}

export default function AdminDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allResults, setAllResults] = useState<Result[]>([]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "students" | "teachers"
  >("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserResults, setSelectedUserResults] = useState<Result[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "student" as "student" | "teacher",
    name: "",
    subject: "",
    avatar: "👤",
  });
  const [expandedResult, setExpandedResult] = useState<number | null>(null);
  const [editingResult, setEditingResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) router.push("/login");
  }, [user, loading, router]);

  const fetchData = useCallback(async () => {
    try {
      const [u, r] = await Promise.all([getUsers(), getResults()]);
      setAllUsers(u);
      setAllResults(r);
    } catch {
      toast.error("Failed to fetch data");
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const students = allUsers.filter((u) => u.role === "student");
  const teachers = allUsers.filter((u) => u.role === "teacher");

  const handleSelectUser = async (u: User) => {
    setSelectedUser(u);
    if (u.role === "student") {
      const res = await getResults({ studentId: u.id });
      setSelectedUserResults(res);
    } else {
      const res = await getResults({ teacherId: u.id });
      setSelectedUserResults(res);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.username || !newUser.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      const id = await getNextId("users");
      await createUser({ ...newUser, id });
      toast.success(
        `${newUser.role === "student" ? "Student" : "Teacher"} added!`,
      );
      setShowAddModal(false);
      setNewUser({
        username: "",
        password: "",
        role: "student",
        name: "",
        subject: "",
        avatar: "👤",
      });
      fetchData();
    } catch {
      toast.error("Failed to add user");
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      await updateUser(editingUser.id, editingUser);
      toast.success("User updated!");
      setEditingUser(null);
      fetchData();
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id);
      toast.success("User deleted");
      if (selectedUser?.id === id) setSelectedUser(null);
      fetchData();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleUpdateResult = async () => {
    if (!editingResult) return;
    try {
      const { id, ...data } = editingResult;
      await updateUser(id, data as any); // reusing updateUser but for results
      // Use proper API
      const axios = (await import("axios")).default;
      await axios.put(`/api/results/${id}`, editingResult);
      toast.success("Result updated!");
      setEditingResult(null);
      fetchData();
      if (selectedUser) handleSelectUser(selectedUser);
    } catch {
      toast.error("Failed to update result");
    }
  };

  const handleDeleteResult = async (id: number) => {
    if (!confirm("Delete this result?")) return;
    try {
      const axios = (await import("axios")).default;
      await axios.delete(`/api/results/${id}`);
      toast.success("Result deleted");
      fetchData();
      if (selectedUser) handleSelectUser(selectedUser);
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Overview stats
  const totalTasks = allResults.length;
  const completedTasks = allResults.filter(
    (r) => r.status === "completed",
  ).length;
  const avgScore =
    completedTasks > 0
      ? Math.round(
          allResults
            .filter((r) => r.status === "completed")
            .reduce((s, r) => s + (r.marks / r.totalMarks) * 100, 0) /
            completedTasks,
        )
      : 0;

  const roleData = [
    { name: "Students", value: students.length, color: "#14b8a6" },
    { name: "Teachers", value: teachers.length, color: "#8b5cf6" },
  ];

  const taskStatusData = [
    { name: "Completed", value: completedTasks, color: "#10b981" },
    {
      name: "Pending",
      value: allResults.filter((r) => r.status === "pending").length,
      color: "#f59e0b",
    },
    {
      name: "Incomplete",
      value: allResults.filter((r) => r.status === "notcompleted").length,
      color: "#ef4444",
    },
  ].filter((d) => d.value > 0);

  const subjectData = Array.from(new Set(allResults.map((r) => r.subject))).map(
    (subj) => ({
      subject: subj,
      count: allResults.filter((r) => r.subject === subj).length,
      avg: Math.round(
        allResults
          .filter((r) => r.subject === subj && r.status === "completed")
          .reduce((s, r) => s + (r.marks / r.totalMarks) * 100, 0) /
          Math.max(
            1,
            allResults.filter(
              (r) => r.subject === subj && r.status === "completed",
            ).length,
          ),
      ),
    }),
  );

  if (loading || !user)
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen animated-bg">
      {/* Top Navbar */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 glass"
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold">
              R
            </div>
            <span className="text-lg font-bold gradient-text">
              Unilife Learning Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 glass rounded-xl px-4 py-2">
              <span className="text-lg">🛡️</span>
              <span className="text-sm font-semibold text-white">
                {user.name}
              </span>
            </div>
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="p-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-red-400 transition"
            >
              <FiLogOut />
            </button>
          </div>
        </div>
      </motion.nav>

      <div className="pt-20 pb-10 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex gap-3 mb-8 overflow-x-auto">
          {[
            {
              key: "overview" as const,
              label: "📊 Overview",
              icon: <FiBarChart2 />,
            },
            {
              key: "students" as const,
              label: "🎓 Students",
              icon: <FiUsers />,
            },
            {
              key: "teachers" as const,
              label: "👨‍🏫 Teachers",
              icon: <FiUser />,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setSelectedUser(null);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/25"
                  : "glass text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ==================== OVERVIEW ==================== */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  {
                    label: "Total Students",
                    value: students.length,
                    gradient: "from-teal-500 to-cyan-600",
                    emoji: "🎓",
                  },
                  {
                    label: "Total Teachers",
                    value: teachers.length,
                    gradient: "from-violet-500 to-purple-600",
                    emoji: "👨‍🏫",
                  },
                  {
                    label: "Total Tasks",
                    value: totalTasks,
                    gradient: "from-amber-500 to-orange-600",
                    emoji: "📝",
                  },
                  {
                    label: "Average Score",
                    value: `${avgScore}%`,
                    gradient: "from-emerald-500 to-green-600",
                    emoji: "📊",
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    className="glass rounded-2xl p-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-500 uppercase tracking-wider">
                        {stat.label}
                      </span>
                      <span className="text-2xl">{stat.emoji}</span>
                    </div>
                    <p className="text-3xl font-black text-white">
                      {stat.value}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <motion.div
                  className="glass rounded-2xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-lg font-bold text-white mb-4">
                    Users Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={roleData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        dataKey="value"
                        paddingAngle={4}
                      >
                        {roleData.map((d, i) => (
                          <Cell key={i} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#1e1b4b",
                          border: "1px solid rgba(245,158,11,0.3)",
                          borderRadius: "12px",
                          color: "#e2e8f0",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6 mt-2">
                    {roleData.map((d, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm text-gray-400"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ background: d.color }}
                        />
                        {d.name}: {d.value}
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  className="glass rounded-2xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-lg font-bold text-white mb-4">
                    Task Status
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={taskStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        dataKey="value"
                        paddingAngle={4}
                      >
                        {taskStatusData.map((d, i) => (
                          <Cell key={i} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#1e1b4b",
                          border: "1px solid rgba(245,158,11,0.3)",
                          borderRadius: "12px",
                          color: "#e2e8f0",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-4 mt-2">
                    {taskStatusData.map((d, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs text-gray-400"
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: d.color }}
                        />
                        {d.name}: {d.value}
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  className="glass rounded-2xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h3 className="text-lg font-bold text-white mb-4">
                    Subject Stats
                  </h3>
                  {subjectData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={subjectData} layout="vertical">
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.05)"
                        />
                        <XAxis
                          type="number"
                          domain={[0, 100]}
                          tick={{ fill: "#9ca3af", fontSize: 10 }}
                        />
                        <YAxis
                          type="category"
                          dataKey="subject"
                          tick={{ fill: "#9ca3af", fontSize: 11 }}
                          width={70}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "#1e1b4b",
                            border: "1px solid rgba(245,158,11,0.3)",
                            borderRadius: "12px",
                            color: "#e2e8f0",
                          }}
                        />
                        <Bar
                          dataKey="avg"
                          fill="#f59e0b"
                          radius={[0, 6, 6, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[220px] flex items-center justify-center text-gray-500">
                      No data
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Quick access tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  className="glass rounded-2xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">
                      Recent Students
                    </h3>
                    <button
                      onClick={() => setActiveTab("students")}
                      className="text-xs text-amber-400 hover:text-amber-300"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="space-y-2">
                    {students.slice(0, 5).map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setActiveTab("students");
                          handleSelectUser(s);
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition text-left"
                      >
                        <span className="text-lg">{s.avatar}</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">
                            {s.name}
                          </p>
                          <p className="text-xs text-gray-500">@{s.username}</p>
                        </div>
                        <FiChevronRight className="text-gray-600" />
                      </button>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  className="glass rounded-2xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Teachers</h3>
                    <button
                      onClick={() => setActiveTab("teachers")}
                      className="text-xs text-amber-400 hover:text-amber-300"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="space-y-2">
                    {teachers.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setActiveTab("teachers");
                          handleSelectUser(t);
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition text-left"
                      >
                        <span className="text-lg">{t.avatar}</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">
                            {t.name}
                          </p>
                          <p className="text-xs text-gray-500">{t.subject}</p>
                        </div>
                        <FiChevronRight className="text-gray-600" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ==================== STUDENTS TAB ==================== */}
          {activeTab === "students" && (
            <motion.div
              key="students"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  🎓 Students ({students.length})
                </h2>
                <div className="flex gap-3">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:border-amber-500 w-56"
                    />
                  </div>
                  <motion.button
                    onClick={() => {
                      setNewUser({
                        username: "",
                        password: "",
                        role: "student",
                        name: "",
                        subject: "",
                        avatar: "👤",
                      });
                      setShowAddModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiPlus /> Add Student
                  </motion.button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {selectedUser ? (
                  <motion.div
                    key={`user-${selectedUser.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition"
                    >
                      <FiArrowLeft /> Back to list
                    </button>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-2xl">
                        {selectedUser.avatar}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">
                          {selectedUser.name}
                        </h3>
                        <p className="text-gray-400">
                          @{selectedUser.username}
                        </p>
                      </div>
                      <div className="ml-auto flex gap-2">
                        <button
                          onClick={() => setEditingUser({ ...selectedUser })}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-semibold hover:bg-amber-500/30 transition"
                        >
                          <FiEdit2 /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(selectedUser.id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/30 transition"
                        >
                          <FiTrash2 /> Delete
                        </button>
                      </div>
                    </div>

                    {/* Student Results */}
                    <div className="glass rounded-2xl p-6">
                      <h4 className="text-lg font-bold text-white mb-4">
                        Results ({selectedUserResults.length})
                      </h4>
                      {selectedUserResults.length > 0 ? (
                        <div className="space-y-3">
                          {selectedUserResults.map((r, i) => {
                            const pct = Math.round(
                              (r.marks / r.totalMarks) * 100,
                            );
                            const g = getGrade(pct);
                            const isExpanded = expandedResult === r.id;
                            return (
                              <motion.div
                                key={r.id}
                                className={`rounded-xl border transition-all ${
                                  isExpanded
                                    ? "border-amber-500/30 bg-amber-500/5"
                                    : "border-white/5 bg-white/[0.02]"
                                }`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                              >
                                <button
                                  onClick={() =>
                                    setExpandedResult(isExpanded ? null : r.id)
                                  }
                                  className="w-full flex items-center gap-4 p-4 text-left"
                                >
                                  <div
                                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold ${
                                      r.status === "completed"
                                        ? "bg-emerald-500/20 text-emerald-400"
                                        : r.status === "pending"
                                          ? "bg-amber-500/20 text-amber-400"
                                          : "bg-red-500/20 text-red-400"
                                    }`}
                                  >
                                    {r.status === "completed" ? (
                                      <FiCheck />
                                    ) : (
                                      <FiXCircle />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-white text-sm truncate">
                                      {r.taskName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {r.subject} • {r.createdAt}
                                    </p>
                                  </div>
                                  <p className={`font-bold text-sm ${g.color}`}>
                                    {r.marks}/{r.totalMarks}
                                  </p>
                                  <FiChevronRight
                                    className={`text-gray-500 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                                  />
                                </button>
                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="px-4 pb-4 pt-2 border-t border-white/5">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                          <div>
                                            <p className="text-xs text-gray-500">
                                              Status
                                            </p>
                                            <p className="text-sm font-semibold text-white">
                                              {r.status}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-xs text-gray-500">
                                              Percentage
                                            </p>
                                            <p
                                              className={`text-sm font-bold ${g.color}`}
                                            >
                                              {pct}% ({g.grade})
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-xs text-gray-500">
                                              Locked
                                            </p>
                                            <p
                                              className={`text-sm font-semibold ${r.locked ? "text-red-400" : "text-emerald-400"}`}
                                            >
                                              {r.locked ? "Yes" : "No"}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-xs text-gray-500">
                                              Submission
                                            </p>
                                            <p className="text-sm text-gray-300 truncate">
                                              {r.studentSubmission || "None"}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() =>
                                              setEditingResult({ ...r })
                                            }
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-semibold hover:bg-amber-500/30 transition"
                                          >
                                            <FiEdit2 /> Edit
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleDeleteResult(r.id)
                                            }
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/30 transition"
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
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          No results found
                        </p>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="student-list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredStudents.map((s, i) => {
                        const sResults = allResults.filter(
                          (r) => r.studentId === s.id,
                        );
                        const completedCount = sResults.filter(
                          (r) => r.status === "completed",
                        ).length;
                        const avg =
                          completedCount > 0
                            ? Math.round(
                                sResults
                                  .filter((r) => r.status === "completed")
                                  .reduce(
                                    (sum, r) =>
                                      sum + (r.marks / r.totalMarks) * 100,
                                    0,
                                  ) / completedCount,
                              )
                            : 0;
                        return (
                          <motion.div
                            key={s.id}
                            className="glass rounded-2xl p-5 cursor-pointer group"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ y: -4, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelectUser(s)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center text-2xl">
                                {s.avatar}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-white truncate">
                                  {s.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  @{s.username}
                                </p>
                              </div>
                              <FiChevronRight className="text-gray-600 group-hover:text-amber-400 transition" />
                            </div>
                            <div className="flex gap-4 mt-4 pt-4 border-t border-white/5">
                              <div>
                                <p className="text-xs text-gray-500">Tasks</p>
                                <p className="font-bold text-white text-sm">
                                  {sResults.length}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">
                                  Completed
                                </p>
                                <p className="font-bold text-emerald-400 text-sm">
                                  {completedCount}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Average</p>
                                <p
                                  className={`font-bold text-sm ${avg >= 70 ? "text-emerald-400" : avg >= 50 ? "text-amber-400" : "text-red-400"}`}
                                >
                                  {avg}%
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ==================== TEACHERS TAB ==================== */}
          {activeTab === "teachers" && (
            <motion.div
              key="teachers"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  👨‍🏫 Teachers ({teachers.length})
                </h2>
                <motion.button
                  onClick={() => {
                    setNewUser({
                      username: "",
                      password: "",
                      role: "teacher",
                      name: "",
                      subject: "",
                      avatar: "👨‍🏫",
                    });
                    setShowAddModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiPlus /> Add Teacher
                </motion.button>
              </div>

              <AnimatePresence mode="wait">
                {selectedUser ? (
                  <motion.div
                    key={`teacher-${selectedUser.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition"
                    >
                      <FiArrowLeft /> Back to list
                    </button>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-2xl">
                        {selectedUser.avatar}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">
                          {selectedUser.name}
                        </h3>
                        <p className="text-gray-400">
                          {selectedUser.subject} • @{selectedUser.username}
                        </p>
                      </div>
                      <div className="ml-auto flex gap-2">
                        <button
                          onClick={() => setEditingUser({ ...selectedUser })}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-semibold hover:bg-amber-500/30 transition"
                        >
                          <FiEdit2 /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(selectedUser.id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/30 transition"
                        >
                          <FiTrash2 /> Delete
                        </button>
                      </div>
                    </div>

                    <div className="glass rounded-2xl p-6">
                      <h4 className="text-lg font-bold text-white mb-4">
                        Uploaded Results ({selectedUserResults.length})
                      </h4>
                      {selectedUserResults.length > 0 ? (
                        <div className="space-y-2">
                          {selectedUserResults.map((r, i) => {
                            const pct = Math.round(
                              (r.marks / r.totalMarks) * 100,
                            );
                            const g = getGrade(pct);
                            const student = allUsers.find(
                              (u) => u.id === r.studentId,
                            );
                            return (
                              <div
                                key={r.id}
                                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5"
                              >
                                <span className="text-lg">
                                  {student?.avatar || "👤"}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-white truncate">
                                    {student?.name} — {r.taskName}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {r.subject} • {r.createdAt}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-white">
                                    {r.marks}/{r.totalMarks}
                                  </p>
                                  <p
                                    className={`text-xs font-semibold ${g.color}`}
                                  >
                                    {g.grade} ({pct}%)
                                  </p>
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => setEditingResult({ ...r })}
                                    className="p-1.5 rounded-lg hover:bg-amber-500/20 text-gray-500 hover:text-amber-400 transition text-xs"
                                  >
                                    <FiEdit2 />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteResult(r.id)}
                                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition text-xs"
                                  >
                                    <FiTrash2 />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          No results uploaded yet
                        </p>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="teacher-list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredTeachers.map((t, i) => {
                        const tResults = allResults.filter(
                          (r) => r.teacherId === t.id,
                        );
                        const uniqueStudents = new Set(
                          tResults.map((r) => r.studentId),
                        ).size;
                        return (
                          <motion.div
                            key={t.id}
                            className="glass rounded-2xl p-5 cursor-pointer group"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ y: -4, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelectUser(t)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center text-2xl">
                                {t.avatar}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-white truncate">
                                  {t.name}
                                </p>
                                <p className="text-xs text-violet-400">
                                  {t.subject}
                                </p>
                              </div>
                              <FiChevronRight className="text-gray-600 group-hover:text-amber-400 transition" />
                            </div>
                            <div className="flex gap-4 mt-4 pt-4 border-t border-white/5">
                              <div>
                                <p className="text-xs text-gray-500">Results</p>
                                <p className="font-bold text-white text-sm">
                                  {tResults.length}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">
                                  Students
                                </p>
                                <p className="font-bold text-violet-400 text-sm">
                                  {uniqueStudents}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              className="glass-strong rounded-3xl p-8 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-6">
                Add {newUser.role === "student" ? "Student" : "Teacher"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-amber-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) =>
                      setNewUser({ ...newUser, username: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-amber-500"
                    placeholder="johndoe"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">
                    Password *
                  </label>
                  <input
                    type="text"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-amber-500"
                    placeholder="password123"
                  />
                </div>
                {newUser.role === "teacher" && (
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">
                      Subject *
                    </label>
                    <input
                      type="text"
                      value={newUser.subject}
                      onChange={(e) =>
                        setNewUser({ ...newUser, subject: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-amber-500"
                      placeholder="Math"
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">
                    Avatar Emoji
                  </label>
                  <input
                    type="text"
                    value={newUser.avatar}
                    onChange={(e) =>
                      setNewUser({ ...newUser, avatar: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-amber-500"
                    placeholder="🦁"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 font-semibold hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold"
                >
                  Add User
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditingUser(null)}
          >
            <motion.div
              className="glass-strong rounded-3xl p-8 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-6">Edit User</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">
                    Username
                  </label>
                  <input
                    type="text"
                    value={editingUser.username}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        username: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">
                    Password
                  </label>
                  <input
                    type="text"
                    value={editingUser.password}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        password: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-amber-500"
                  />
                </div>
                {editingUser.role === "teacher" && (
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={editingUser.subject}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          subject: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-amber-500"
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">
                    Avatar
                  </label>
                  <input
                    type="text"
                    value={editingUser.avatar}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, avatar: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-amber-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 font-semibold hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateUser}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Result Modal */}
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
              className="glass-strong rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-6">Edit Result</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">
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
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-amber-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">
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
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">
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
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-amber-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">
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
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-amber-500"
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
                    <label className="text-sm text-gray-400 mb-1 block">
                      Locked
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
                  <label className="text-sm text-gray-400 mb-1 block">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={editingResult.subject}
                    onChange={(e) =>
                      setEditingResult({
                        ...editingResult,
                        subject: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">
                    Student Submission
                  </label>
                  <textarea
                    value={editingResult.studentSubmission}
                    onChange={(e) =>
                      setEditingResult({
                        ...editingResult,
                        studentSubmission: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-amber-500 resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingResult(null)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 font-semibold hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateResult}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
