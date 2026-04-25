import { updateUser } from "@/lib/api";
import { Result, User } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";

export default function EditResultModal({
  editingResult,
  setEditingResult,
  fetchData,
  selectedUser,
  handleSelectUser,
}: {
  editingResult: Result | null;
  setEditingResult: React.Dispatch<React.SetStateAction<Result | null>>;
  fetchData: () => Promise<void>;
  selectedUser: User | null;
  handleSelectUser: (u: User) => Promise<void>;
}) {
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
  return (
    <>
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
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                Edit Result
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
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-amber-500"
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
                      className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-amber-500"
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
                      className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-amber-500"
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
                      className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-amber-500"
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
                  <label className="text-sm text-slate-600 dark:text-gray-400 mb-1 block">
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
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600 dark:text-gray-400 mb-1 block">
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
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-amber-500 resize-none"
                  />
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
                  onClick={handleUpdateResult}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-slate-900 dark:text-white font-semibold"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
