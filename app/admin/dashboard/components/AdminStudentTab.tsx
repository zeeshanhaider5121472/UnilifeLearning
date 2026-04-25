import { Result, User } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiArrowLeft,
  FiCheck,
  FiChevronRight,
  FiEdit2,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiXCircle,
} from "react-icons/fi";

export default function AdminStudentTab({
  activeTab,
  setSearchQuery,
  searchQuery,
  students,
  setNewUser,
  setShowAddModal,
  selectedUser,
  setSelectedUser,
  setEditingUser,
  handleDeleteUser,
  selectedUserResults,
  setExpandedResult,
  expandedResult,
  getGrade,
  setEditingResult,
  handleDeleteResult,
  filteredStudents,
  allResults,
  handleSelectUser,
}: {
  activeTab: "overview" | "teachers" | "students";
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  searchQuery: string;
  students: User[];
  setNewUser: React.Dispatch<
    React.SetStateAction<{
      username: string;
      password: string;
      role: "student" | "teacher";
      name: string;
      subject: string;
      avatar: string;
    }>
  >;
  setShowAddModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedUser: User | null;
  setSelectedUser: React.Dispatch<React.SetStateAction<User | null>>;
  setEditingUser: React.Dispatch<React.SetStateAction<User | null>>;
  handleDeleteUser: (id: number) => Promise<void>;
  selectedUserResults: Result[];
  setExpandedResult: React.Dispatch<React.SetStateAction<number | null>>;
  expandedResult: number | null;
  getGrade(pct: number): {
    grade: string;
    color: string;
  };
  setEditingResult: React.Dispatch<React.SetStateAction<Result | null>>;
  handleDeleteResult: (id: number) => Promise<void>;
  filteredStudents: User[];
  allResults: Result[];
  handleSelectUser: (u: User) => Promise<void>;
}) {
  return (
    <>
      {activeTab === "students" && (
        <motion.div
          key="students"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              🎓 Students ({students.length})
            </h2>
            <div className="flex gap-3">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2.5 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm placeholder-gray-500 focus:border-amber-500 w-56"
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
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-slate-900 dark:text-white font-semibold text-sm"
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
                  className="flex items-center gap-2 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white mb-4 transition"
                >
                  <FiArrowLeft /> Back to list
                </button>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-2xl">
                    {selectedUser.avatar}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {selectedUser.name}
                    </h3>
                    <p className="text-slate-600 dark:text-gray-400">
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
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                    Results ({selectedUserResults.length})
                  </h4>
                  {selectedUserResults.length > 0 ? (
                    <div className="space-y-3">
                      {selectedUserResults.map((r, i) => {
                        const pct = Math.round((r.marks / r.totalMarks) * 100);
                        const g = getGrade(pct);
                        const isExpanded = expandedResult === r.id;
                        return (
                          <motion.div
                            key={r.id}
                            className={`rounded-xl border transition-all ${
                              isExpanded
                                ? "border-amber-500/30 bg-amber-500/5"
                                : "border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]"
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
                                <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                                  {r.taskName}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-gray-500">
                                  {r.subject} • {r.createdAt}
                                </p>
                              </div>
                              <p className={`font-bold text-sm ${g.color}`}>
                                {r.marks}/{r.totalMarks}
                              </p>
                              <FiChevronRight
                                className={`text-slate-500 dark:text-gray-500 transition-transform ${isExpanded ? "rotate-90" : ""}`}
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
                                  <div className="px-4 pb-4 pt-2 border-t border-slate-200 dark:border-white/5">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                      <div>
                                        <p className="text-xs text-slate-500 dark:text-gray-500">
                                          Status
                                        </p>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                          {r.status}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-slate-500 dark:text-gray-500">
                                          Percentage
                                        </p>
                                        <p
                                          className={`text-sm font-bold ${g.color}`}
                                        >
                                          {pct}% ({g.grade})
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-slate-500 dark:text-gray-500">
                                          Locked
                                        </p>
                                        <p
                                          className={`text-sm font-semibold ${r.locked ? "text-red-400" : "text-emerald-400"}`}
                                        >
                                          {r.locked ? "Yes" : "No"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-slate-500 dark:text-gray-500">
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
                                        onClick={() => handleDeleteResult(r.id)}
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
                    <p className="text-slate-500 dark:text-gray-500 text-center py-4">
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
                            <p className="font-bold text-slate-900 dark:text-white truncate">
                              {s.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-gray-500">
                              @{s.username}
                            </p>
                          </div>
                          <FiChevronRight className="text-gray-600 group-hover:text-amber-400 transition" />
                        </div>
                        <div className="flex gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-white/5">
                          <div>
                            <p className="text-xs text-slate-500 dark:text-gray-500">
                              Tasks
                            </p>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">
                              {sResults.length}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 dark:text-gray-500">
                              Completed
                            </p>
                            <p className="font-bold text-emerald-400 text-sm">
                              {completedCount}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 dark:text-gray-500">
                              Average
                            </p>
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
    </>
  );
}
