import { User } from "@/lib/types";
import { motion } from "framer-motion";
import { FiChevronRight } from "react-icons/fi";
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

export default function AdminOverviewTab({
  activeTab,
  teachers,
  students,
  totalTasks,
  avgScore,
  roleData,
  taskStatusData,
  subjectData,
  setActiveTab,
  handleSelectUser,
}: {
  activeTab: "overview" | "teachers" | "students";
  teachers: User[];
  students: User[];
  totalTasks: number;
  avgScore: number;
  roleData: {
    name: string;
    value: number;
    color: string;
  }[];
  taskStatusData: {
    name: string;
    value: number;
    color: string;
  }[];
  subjectData: {
    subject: string;
    count: number;
    avg: number;
  }[];
  setActiveTab: React.Dispatch<
    React.SetStateAction<"overview" | "students" | "teachers">
  >;
  handleSelectUser: (u: User) => Promise<void>;
}) {
  return (
    <>
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
                  <span className="text-xs text-slate-500 dark:text-gray-500 uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <span className="text-2xl">{stat.emoji}</span>
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">
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
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
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
                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400"
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
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
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
                    className="flex items-center gap-2 text-xs text-slate-600 dark:text-gray-400"
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
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
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
                    <Bar dataKey="avg" fill="#f59e0b" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-slate-500 dark:text-gray-500">
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
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
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
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 dark:bg-white/5 transition text-left"
                  >
                    <span className="text-lg">{s.avatar}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {s.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-gray-500">
                        @{s.username}
                      </p>
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
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Teachers
                </h3>
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
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 dark:bg-white/5 transition text-left"
                  >
                    <span className="text-lg">{t.avatar}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {t.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-gray-500">
                        {t.subject}
                      </p>
                    </div>
                    <FiChevronRight className="text-gray-600" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </>
  );
}
