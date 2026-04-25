import { updateUser } from "@/lib/api";
import { User } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";

export default function EditUserModal({
  editingUser,
  setEditingUser,
  fetchData,
}: {
  editingUser: User | null;
  setEditingUser: React.Dispatch<React.SetStateAction<User | null>>;
  fetchData: () => Promise<void>;
}) {
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
  return (
    <>
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
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                Edit User
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-600 dark:text-gray-400 mb-1 block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600 dark:text-gray-400 mb-1 block">
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
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600 dark:text-gray-400 mb-1 block">
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
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-amber-500"
                  />
                </div>
                {editingUser.role === "teacher" && (
                  <div>
                    <label className="text-sm text-slate-600 dark:text-gray-400 mb-1 block">
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
                      className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-amber-500"
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm text-slate-600 dark:text-gray-400 mb-1 block">
                    Avatar
                  </label>
                  <input
                    type="text"
                    value={editingUser.avatar}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, avatar: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-amber-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 font-semibold hover:bg-white/50 dark:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateUser}
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
