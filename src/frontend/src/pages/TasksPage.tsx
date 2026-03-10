import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Check,
  CheckSquare,
  Filter,
  Flame,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Task } from "../backend-shim.d.ts";
import {
  useAddTask,
  useDeleteTask,
  useTaskStreak,
  useTasks,
  useUpdateTaskStatus,
} from "../hooks/useQueries";

const TASK_SKELETON_IDS = ["tsk-sk-1", "tsk-sk-2", "tsk-sk-3", "tsk-sk-4"];

function getTodayDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type FilterStatus = "all" | "pending" | "completed";
type FilterPriority = "all" | "High" | "Medium" | "Low";

const priorityClass: Record<string, string> = {
  High: "priority-high",
  Medium: "priority-medium",
  Low: "priority-low",
};

/** Large, touch-friendly circular toggle button for marking tasks */
function TaskToggleButton({
  completed,
  isPending,
  onToggle,
}: {
  completed: boolean;
  isPending: boolean;
  onToggle: (val: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!completed)}
      disabled={isPending}
      aria-label={completed ? "Mark as pending" : "Mark as completed"}
      className={`
        shrink-0 w-9 h-9 rounded-full flex items-center justify-center
        transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none
        ${
          completed
            ? "bg-emerald-500/20 border-2 border-emerald-500 hover:bg-emerald-500/30"
            : "bg-muted/60 border-2 border-border hover:border-primary/40 hover:bg-primary/5"
        }
        ${isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      ) : completed ? (
        <Check className="w-4 h-4 text-emerald-500" strokeWidth={2.5} />
      ) : (
        <X className="w-4 h-4 text-muted-foreground/50" strokeWidth={2} />
      )}
    </button>
  );
}

function TaskCard({ task }: { task: Task }) {
  const updateStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();

  const handleToggle = async (checked: boolean) => {
    try {
      await updateStatus.mutateAsync({ taskId: task.id, completed: checked });
      if (checked) toast.success("Task completed! 🎉");
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask.mutateAsync(task.id);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
        task.completed
          ? "bg-muted/40 border-border/40 opacity-60"
          : "bg-card border-border/60 hover:border-primary/20"
      }`}
    >
      <TaskToggleButton
        completed={task.completed}
        isPending={updateStatus.isPending}
        onToggle={handleToggle}
      />
      <div className="flex-1 min-w-0">
        <div
          className={`font-medium text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}
        >
          {task.title}
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          {task.subjectName && (
            <>
              <span className="text-xs text-muted-foreground">
                {task.subjectName}
              </span>
              <span className="text-muted-foreground/40 text-xs">·</span>
            </>
          )}
          <span className="text-xs text-muted-foreground">
            Due {task.dueDate}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityClass[task.priority] || "priority-low"}`}
          >
            {task.priority}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleteTask.isPending}
        className="text-muted-foreground/40 hover:text-destructive transition-colors shrink-0 p-1"
        aria-label="Delete task"
      >
        {deleteTask.isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Trash2 className="w-3.5 h-3.5" />
        )}
      </button>
    </motion.div>
  );
}

export default function TasksPage() {
  const { data: tasks = [], isLoading } = useTasks();
  const { data: streak = BigInt(0) } = useTaskStreak();
  const addTask = useAddTask();

  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [priority, setPriority] = useState("Medium");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterPriority, setFilterPriority] = useState<FilterPriority>("all");
  const [showForm, setShowForm] = useState(false);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a task title");
      return;
    }
    try {
      await addTask.mutateAsync({
        title: title.trim(),
        subjectName: "",
        dueDate,
        priority,
      });
      toast.success("Task added!");
      setTitle("");
      setShowForm(false);
    } catch {
      toast.error("Failed to add task");
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus === "pending" && t.completed) return false;
    if (filterStatus === "completed" && !t.completed) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const priorityOrder: Record<string, number> = {
      High: 0,
      Medium: 1,
      Low: 2,
    };
    return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
  });

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <CheckSquare className="w-7 h-7 text-teal-400" />
              Tasks
            </h1>
            <p className="text-muted-foreground mt-1">
              {pendingCount} pending · {completedCount} completed
            </p>
          </div>

          {/* Streak badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-400/10 border border-rose-400/20">
            <Flame className="w-5 h-5 text-rose-400" />
            <div>
              <div className="font-display font-bold text-lg leading-none">
                {Number(streak)}
              </div>
              <div className="text-xs text-muted-foreground leading-none mt-0.5">
                day streak
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Add Task Button / Form */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border/60 rounded-xl p-5 mb-5"
      >
        {!showForm ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Add new task...</span>
          </button>
        ) : (
          <form onSubmit={handleAddTask} className="space-y-4">
            <h3 className="font-display font-semibold">New Task</h3>

            <div className="space-y-2">
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                placeholder="e.g. Solve 20 Trigonometry problems, Sleep 8 hours..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-background border-border"
                autoFocus
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="due-date">Due Date</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">🔴 High</SelectItem>
                    <SelectItem value="Medium">🟡 Medium</SelectItem>
                    <SelectItem value="Low">🟢 Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={addTask.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {addTask.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="border-border"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap gap-2 mb-4"
      >
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Filter className="w-3.5 h-3.5" />
          Filter:
        </div>

        {/* Status filter */}
        {(["all", "pending", "completed"] as FilterStatus[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilterStatus(s)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              filterStatus === s
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-muted/50 text-muted-foreground border border-border/50 hover:border-primary/20"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}

        <div className="w-px h-5 bg-border self-center" />

        {/* Priority filter */}
        {(["all", "High", "Medium", "Low"] as FilterPriority[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setFilterPriority(p)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              filterPriority === p
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-muted/50 text-muted-foreground border border-border/50 hover:border-primary/20"
            }`}
          >
            {p === "all" ? "All Priority" : p}
          </button>
        ))}
      </motion.div>

      {/* Task list */}
      {isLoading ? (
        <div className="space-y-3">
          {TASK_SKELETON_IDS.map((id) => (
            <Skeleton key={id} className="h-20 rounded-xl skeleton-shimmer" />
          ))}
        </div>
      ) : sortedTasks.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border/60 rounded-xl">
          <div className="text-5xl mb-4">📋</div>
          <div className="font-display font-semibold text-lg">
            {filterStatus !== "all" || filterPriority !== "all"
              ? "No tasks match your filter"
              : "No tasks yet"}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {filterStatus !== "all" || filterPriority !== "all"
              ? "Try adjusting the filters"
              : "Add your first task to get started"}
          </div>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-2.5">
            {sortedTasks.map((task) => (
              <TaskCard key={task.id.toString()} task={task} />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
