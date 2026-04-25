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
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiBarChart2, FiUser, FiUsers } from "react-icons/fi";
import AdminOverviewTab from "./components/AdminOverviewTab";
import AdminStudentTab from "./components/AdminStudentTab";
import AdminTeachersTab from "./components/AdminTeachersTab";
import AdminTopNav from "./components/AdminTopNav";
import AddUserModal from "./components/modals/AddUserModal";
import EditResultModal from "./components/modals/EditResultModal";
import EditUserModal from "./components/modals/EditUserModal";

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
      <AdminTopNav user={user} logout={logout} />

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
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 text-slate-900 dark:text-white shadow-lg shadow-amber-500/25"
                  : "glass text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ==================== OVERVIEW TAB==================== */}
          <AdminOverviewTab
            activeTab={activeTab}
            teachers={teachers}
            students={students}
            totalTasks={totalTasks}
            avgScore={avgScore}
            roleData={roleData}
            taskStatusData={taskStatusData}
            subjectData={subjectData}
            setActiveTab={setActiveTab}
            handleSelectUser={handleSelectUser}
          />

          {/* ==================== STUDENTS TAB ==================== */}
          <AdminStudentTab
            activeTab={activeTab}
            setSearchQuery={setSearchQuery}
            searchQuery={searchQuery}
            setEditingResult={setEditingResult}
            handleDeleteResult={handleDeleteResult}
            setExpandedResult={setExpandedResult}
            expandedResult={expandedResult}
            students={students}
            setNewUser={setNewUser}
            setShowAddModal={setShowAddModal}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            setEditingUser={setEditingUser}
            handleDeleteUser={handleDeleteUser}
            selectedUserResults={selectedUserResults}
            getGrade={getGrade}
            filteredStudents={filteredStudents}
            allResults={allResults}
            handleSelectUser={handleSelectUser}
          />

          {/* ==================== TEACHERS TAB ==================== */}
          <AdminTeachersTab
            activeTab={activeTab}
            teachers={teachers}
            setNewUser={setNewUser}
            setShowAddModal={setShowAddModal}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            setEditingUser={setEditingUser}
            handleDeleteUser={handleDeleteUser}
            selectedUserResults={selectedUserResults}
            filteredTeachers={filteredTeachers}
            setEditingResult={setEditingResult}
            handleDeleteResult={handleDeleteResult}
            getGrade={getGrade}
            allUsers={allUsers}
            allResults={allResults}
            handleSelectUser={handleSelectUser}
          />
        </AnimatePresence>
      </div>

      {/* Add User Modal */}
      <AddUserModal
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        newUser={newUser}
        setNewUser={setNewUser}
        fetchData={fetchData}
        />

      {/* Edit User Modal */}
      <EditUserModal
        editingUser={editingUser}
        setEditingUser={setEditingUser}
        fetchData={fetchData}
        />

      {/* Edit Result Modal */}
      <EditResultModal
        editingResult={editingResult}
        setEditingResult={setEditingResult}
        fetchData={fetchData}
        selectedUser={selectedUser}
        handleSelectUser={handleSelectUser}
      />
    </div>
  );
}
