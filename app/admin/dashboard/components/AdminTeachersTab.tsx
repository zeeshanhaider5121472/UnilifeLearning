import { Result, User } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowLeft, FiChevronRight, FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";

export default function AdminTeachersTab({
      activeTab,
      teachers,
      setNewUser,
      setShowAddModal,
      selectedUser,
      setSelectedUser,
      setEditingUser,
      handleDeleteUser,
      selectedUserResults,
      getGrade,
      allUsers,
      allResults,
      handleSelectUser,
      filteredTeachers,
      setEditingResult,
      handleDeleteResult,
}:{
        activeTab: "overview" | "teachers" | "students";
        teachers: User[];
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
        getGrade(pct: number): {
          grade: string;
          color: string;
        };
        allUsers: User[];
        allResults: Result[];
        handleSelectUser: (u: User) => Promise<void>;
        filteredTeachers: User[];
        setEditingResult: React.Dispatch<React.SetStateAction<Result | null>>;
        handleDeleteResult: (id: number) => Promise<void>;
}) {
  return (
  <>
   {activeTab === "teachers" && (
            <motion.div
              key="teachers"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
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
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-slate-900 dark:text-white font-semibold text-sm"
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
                      className="flex items-center gap-2 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white mb-4 transition"
                    >
                      <FiArrowLeft /> Back to list
                    </button>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-2xl">
                        {selectedUser.avatar}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                          {selectedUser.name}
                        </h3>
                        <p className="text-slate-600 dark:text-gray-400">
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
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
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
                                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5"
                              >
                                <span className="text-lg">
                                  {student?.avatar || "👤"}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                    {student?.name} — {r.taskName}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-gray-500">
                                    {r.subject} • {r.createdAt}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-slate-900 dark:text-white">
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
                                    className="p-1.5 rounded-lg hover:bg-amber-500/20 text-slate-500 dark:text-gray-500 hover:text-amber-400 transition text-xs"
                                  >
                                    <FiEdit2 />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteResult(r.id)}
                                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 dark:text-gray-500 hover:text-red-400 transition text-xs"
                                  >
                                    <FiTrash2 />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-slate-500 dark:text-gray-500 text-center py-4">
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
                                <p className="font-bold text-slate-900 dark:text-white truncate">
                                  {t.name}
                                </p>
                                <p className="text-xs text-violet-400">
                                  {t.subject}
                                </p>
                              </div>
                              <FiChevronRight className="text-gray-600 group-hover:text-amber-400 transition" />
                            </div>
                            <div className="flex gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-white/5">
                              <div>
                                <p className="text-xs text-slate-500 dark:text-gray-500">
                                  Results
                                </p>
                                <p className="font-bold text-slate-900 dark:text-white text-sm">
                                  {tResults.length}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 dark:text-gray-500">
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
  </>
  );
}
