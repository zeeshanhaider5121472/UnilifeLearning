import { createUser, getNextId } from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";

export default function AddUserModal({
  showAddModal,
  setShowAddModal,
  newUser,
  setNewUser,
  fetchData,
}: {
  showAddModal: boolean;
  setShowAddModal: React.Dispatch<React.SetStateAction<boolean>>;
  newUser: {
    username: string;
    password: string;
    role: "student" | "teacher";
    name: string;
    subject: string;
    avatar: string;
  };
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
  fetchData: () => Promise<void>;
}) {
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
  return (
    <>
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
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                Add {newUser.role === "student" ? "Student" : "Teacher"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-600 dark:text-gray-400 mb-1 block">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-gray-500 focus:border-amber-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600 dark:text-gray-400 mb-1 block">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) =>
                      setNewUser({ ...newUser, username: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-gray-500 focus:border-amber-500"
                    placeholder="johndoe"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600 dark:text-gray-400 mb-1 block">
                    Password *
                  </label>
                  <input
                    type="text"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-gray-500 focus:border-amber-500"
                    placeholder="password123"
                  />
                </div>
                {newUser.role === "teacher" && (
                  <div>
                    <label className="text-sm text-slate-600 dark:text-gray-400 mb-1 block">
                      Subject *
                    </label>
                    <input
                      type="text"
                      value={newUser.subject}
                      onChange={(e) =>
                        setNewUser({ ...newUser, subject: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-gray-500 focus:border-amber-500"
                      placeholder="Math"
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm text-slate-600 dark:text-gray-400 mb-1 block">
                    Avatar Emoji
                  </label>
                  <input
                    type="text"
                    value={newUser.avatar}
                    onChange={(e) =>
                      setNewUser({ ...newUser, avatar: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-gray-500 focus:border-amber-500"
                    placeholder="🦁"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 font-semibold hover:bg-white/50 dark:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-slate-900 dark:text-white font-semibold"
                >
                  Add User
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
