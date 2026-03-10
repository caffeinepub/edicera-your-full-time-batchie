import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckSquare,
  Flame,
  Plus,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { UserProfile } from "../backend-shim.d.ts";
import { useDashboardStats, useTasks } from "../hooks/useQueries";

interface DashboardPageProps {
  userProfile: UserProfile | null;
  onNavigate: (tab: "attendance" | "tasks" | "subjects") => void;
}

function useCountUp(target: number, duration = 700) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(eased * target));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  bg: string;
  border: string;
  delay: number;
  suffix?: string;
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
  border,
  delay,
  suffix = "",
}: StatCardProps) {
  const animatedValue = useCountUp(value, 700);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      whileHover={{ y: -3, scale: 1.02 }}
      className={`glass card-shine rounded-xl border ${border} p-5 hover:border-primary/40 transition-all duration-300 cursor-default shadow-card`}
    >
      <div className="mb-4">
        <div
          className={`w-10 h-10 rounded-xl ${bg} border ${border} flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
      <div className="text-3xl font-display font-extrabold text-foreground mb-1 stat-number">
        {animatedValue}
        {suffix}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </motion.div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const SKELETON_IDS = ["sk-1", "sk-2", "sk-3", "sk-4"];
const TASK_SKELETON_IDS = ["tsk-1", "tsk-2", "tsk-3"];
const priorityColors: Record<string, string> = {
  High: "priority-high",
  Medium: "priority-medium",
  Low: "priority-low",
};

const quickActions = [
  {
    tab: "attendance" as const,
    label: "Log Attendance",
    sub: "Mark today's classes",
    icon: Calendar,
    color: "text-amber-300",
    bg: "bg-amber-300/10",
    hover: "hover:border-amber-300/40 hover:bg-amber-300/5",
  },
  {
    tab: "tasks" as const,
    label: "Add Task",
    sub: "Set a new study goal",
    icon: CheckSquare,
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    hover: "hover:border-violet-400/40 hover:bg-violet-400/5",
  },
  {
    tab: "subjects" as const,
    label: "Add Notes",
    sub: "Upload & enrich with AI",
    icon: BookOpen,
    color: "text-teal-400",
    bg: "bg-teal-400/10",
    hover: "hover:border-teal-400/40 hover:bg-teal-400/5",
  },
];

export default function DashboardPage({
  userProfile,
  onNavigate,
}: DashboardPageProps) {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const pendingTasks = tasks?.filter((t) => !t.completed).slice(0, 3) || [];
  const today = new Date();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto pb-24 md:pb-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-8"
      >
        <p className="text-muted-foreground text-sm mb-1 font-medium">
          {formatDate(today)}
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold">
          {getGreeting()},{" "}
          <span className="gradient-text">
            {userProfile?.name?.split(" ")[0] || "Student"}
          </span>{" "}
          👋
        </h1>
        {userProfile && (
          <p className="text-muted-foreground mt-1 text-sm">
            {userProfile.level === "School" && userProfile.educationClass
              ? `CBSE ${userProfile.educationClass}`
              : userProfile.educationClass || userProfile.level || ""}
            {(userProfile.subjects?.length ?? 0) > 0 && (
              <>
                {" · "}
                {userProfile.subjects.slice(0, 3).join(", ")}
                {userProfile.subjects.length > 3 &&
                  ` +${userProfile.subjects.length - 3} more`}
              </>
            )}
          </p>
        )}
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {statsLoading ? (
          SKELETON_IDS.map((id) => (
            <div
              key={id}
              className="glass rounded-xl border border-border/60 p-5 h-[130px]"
            >
              <Skeleton className="w-10 h-10 rounded-xl mb-4 skeleton-shimmer" />
              <Skeleton className="h-8 w-14 mb-2 skeleton-shimmer" />
              <Skeleton className="h-3 w-20 skeleton-shimmer" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              icon={Calendar}
              label="Today's Classes"
              value={Number(stats?.todayAttendanceCount ?? 0)}
              color="text-amber-300"
              bg="bg-amber-300/10"
              border="border-amber-300/20"
              delay={0}
            />
            <StatCard
              icon={CheckSquare}
              label="Pending Tasks"
              value={Number(stats?.pendingTasksCount ?? 0)}
              color="text-violet-400"
              bg="bg-violet-400/10"
              border="border-violet-400/20"
              delay={0.06}
            />
            <StatCard
              icon={BookOpen}
              label="Total Notes"
              value={Number(stats?.totalNotes ?? 0)}
              color="text-teal-400"
              bg="bg-teal-400/10"
              border="border-teal-400/20"
              delay={0.12}
            />
            <StatCard
              icon={Flame}
              label="Day Streak"
              value={Number(stats?.taskStreak ?? 0)}
              suffix=" 🔥"
              color="text-rose-400"
              bg="bg-rose-400/10"
              border="border-rose-400/20"
              delay={0.18}
            />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.22 }}
          className="glass rounded-xl border border-border/60 p-5 shadow-card"
        >
          <h2 className="font-display font-bold text-lg mb-4">Quick Actions</h2>
          <div className="space-y-2.5">
            {quickActions.map((item) => (
              <motion.button
                key={item.tab}
                type="button"
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate(item.tab)}
                className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl bg-background/40 border border-border/50 ${item.hover} transition-all group`}
              >
                <div
                  className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}
                >
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-sm">{item.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.sub}
                  </div>
                </div>
                <Plus className="w-4 h-4 text-muted-foreground/40 group-hover:text-foreground/60 transition-colors" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.28 }}
          className="glass rounded-xl border border-border/60 p-5 shadow-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg">Upcoming Tasks</h2>
            <button
              type="button"
              onClick={() => onNavigate("tasks")}
              className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors font-medium"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {tasksLoading ? (
            <div className="space-y-2.5">
              {TASK_SKELETON_IDS.map((id) => (
                <Skeleton
                  key={id}
                  className="h-14 rounded-lg skeleton-shimmer"
                />
              ))}
            </div>
          ) : pendingTasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🎉</div>
              <div className="font-display font-semibold">All caught up!</div>
              <div className="text-sm text-muted-foreground mt-1">
                No pending tasks right now
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-3 border-border hover:border-primary/40"
                onClick={() => onNavigate("tasks")}
              >
                Add a task
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingTasks.map((task, i) => (
                <motion.div
                  key={task.id.toString()}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-background/40 border border-border/50"
                >
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {task.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {task.subjectName} · Due {task.dueDate}
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${priorityColors[task.priority] || "priority-low"}`}
                  >
                    {task.priority}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <div className="mt-8 pt-6 border-t border-border/30 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ·{" "}
        <span className="font-display font-bold gradient-text-blue">
          EDUCERA
        </span>{" "}
        · Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="text-primary hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          caffeine.ai
        </a>
      </div>
    </div>
  );
}
