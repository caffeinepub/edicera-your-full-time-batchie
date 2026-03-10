import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as dataStore from "../utils/dataStore";
import { useAuth } from "./useAuth";

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Convert number → bigint for backwards-compat with existing components
function toBigInt(n: number): bigint {
  return BigInt(n);
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export function useUserProfile() {
  const { currentUser } = useAuth();
  const userId = currentUser?.username ?? "";

  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const p = dataStore.getUserProfile(userId);
      if (!p) return null;
      // Return shape matching backend-shim.d.ts UserProfile
      return {
        name: p.name,
        level: p.level,
        educationClass: p.educationClass,
        subjects: p.subjects,
      };
    },
    enabled: !!userId,
  });
}

export function useSetUserProfile() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      level: string;
      classLevel: string | null;
      subjects: string[];
    }) => {
      const userId = currentUser?.username;
      if (!userId) throw new Error("Not logged in");
      dataStore.setUserProfile(
        userId,
        data.name,
        data.level,
        data.classLevel,
        data.subjects,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

// ─── Subjects ─────────────────────────────────────────────────────────────────

export function useSubjects() {
  const { currentUser } = useAuth();
  const userId = currentUser?.username ?? "";

  return useQuery({
    queryKey: ["subjects", userId],
    queryFn: async () => {
      if (!userId) return [];
      return dataStore.getSubjects(userId).map((s) => ({
        id: toBigInt(s.id),
        name: s.name,
        level: s.level,
        createdAt: toBigInt(s.createdAt),
      }));
    },
    enabled: !!userId,
  });
}

export function useAddSubject() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const userId = currentUser?.username;
      if (!userId) throw new Error("Not logged in");
      const id = dataStore.addSubject(userId, name);
      return toBigInt(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

export function useDeleteSubject() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      const userId = currentUser?.username;
      if (!userId) throw new Error("Not logged in");
      dataStore.deleteSubject(userId, Number(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export function useAttendanceRecords() {
  const { currentUser } = useAuth();
  const userId = currentUser?.username ?? "";

  return useQuery({
    queryKey: ["attendance", userId],
    queryFn: async () => {
      if (!userId) return [];
      return dataStore.getAttendanceRecords(userId).map((r) => ({
        id: toBigInt(r.id),
        subjectId: toBigInt(r.subjectId),
        subjectName: r.subjectName,
        date: r.date,
        topicCovered: r.topicCovered,
        attended: r.attended,
        createdAt: toBigInt(r.createdAt),
      }));
    },
    enabled: !!userId,
  });
}

export function useLogAttendance() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      subjectId: bigint;
      subjectName: string;
      date: string;
      topicCovered: string;
      attended: boolean;
    }) => {
      const userId = currentUser?.username;
      if (!userId) throw new Error("Not logged in");
      const id = dataStore.logAttendance(
        userId,
        Number(data.subjectId),
        data.subjectName,
        data.date,
        data.topicCovered,
        data.attended,
      );
      return toBigInt(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useUpdateAttendanceRecord() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      recordId: bigint;
      topicCovered: string;
      attended: boolean;
    }) => {
      const userId = currentUser?.username;
      if (!userId) throw new Error("Not logged in");
      dataStore.updateAttendanceRecord(
        userId,
        Number(data.recordId),
        data.topicCovered,
        data.attended,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export function useTasks() {
  const { currentUser } = useAuth();
  const userId = currentUser?.username ?? "";

  return useQuery({
    queryKey: ["tasks", userId],
    queryFn: async () => {
      if (!userId) return [];
      return dataStore.getTasks(userId).map((t) => ({
        id: toBigInt(t.id),
        title: t.title,
        subjectName: t.subjectName,
        dueDate: t.dueDate,
        priority: t.priority,
        completed: t.completed,
        createdAt: toBigInt(t.createdAt),
      }));
    },
    enabled: !!userId,
  });
}

export function useAddTask() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      subjectName: string;
      dueDate: string;
      priority: string;
    }) => {
      const userId = currentUser?.username;
      if (!userId) throw new Error("Not logged in");
      const id = dataStore.addTask(
        userId,
        data.title,
        data.subjectName,
        data.dueDate,
        data.priority,
      );
      return toBigInt(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useUpdateTaskStatus() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      completed,
    }: { taskId: bigint; completed: boolean }) => {
      const userId = currentUser?.username;
      if (!userId) throw new Error("Not logged in");
      dataStore.updateTaskStatus(userId, Number(taskId), completed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      queryClient.invalidateQueries({ queryKey: ["taskStreak"] });
    },
  });
}

export function useDeleteTask() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: bigint) => {
      const userId = currentUser?.username;
      if (!userId) throw new Error("Not logged in");
      dataStore.deleteTask(userId, Number(taskId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useTaskStreak() {
  const { currentUser } = useAuth();
  const userId = currentUser?.username ?? "";

  return useQuery({
    queryKey: ["taskStreak", userId],
    queryFn: async () => {
      if (!userId) return BigInt(0);
      return toBigInt(dataStore.getTaskStreak(userId));
    },
    enabled: !!userId,
  });
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export function useNotes() {
  const { currentUser } = useAuth();
  const userId = currentUser?.username ?? "";

  return useQuery({
    queryKey: ["notes", userId],
    queryFn: async () => {
      if (!userId) return [];
      return dataStore.getNotes(userId).map((n) => ({
        id: toBigInt(n.id),
        subjectId: toBigInt(n.subjectId),
        subjectName: n.subjectName,
        title: n.title,
        content: n.content,
        aiSummary: n.aiSummary,
        aiKeyTopics: n.aiKeyTopics,
        aiShortNotes: n.aiShortNotes,
        aiPyqs: n.aiPyqs,
        uploadedAt: toBigInt(n.uploadedAt),
      }));
    },
    enabled: !!userId,
  });
}

export function useNotesBySubject(subjectId: bigint | null) {
  const { currentUser } = useAuth();
  const userId = currentUser?.username ?? "";

  return useQuery({
    queryKey: ["notes", "subject", subjectId?.toString(), userId],
    queryFn: async () => {
      if (!userId || subjectId === null) return [];
      return dataStore
        .getNotesBySubject(userId, Number(subjectId))
        .map((n) => ({
          id: toBigInt(n.id),
          subjectId: toBigInt(n.subjectId),
          subjectName: n.subjectName,
          title: n.title,
          content: n.content,
          aiSummary: n.aiSummary,
          aiKeyTopics: n.aiKeyTopics,
          aiShortNotes: n.aiShortNotes,
          aiPyqs: n.aiPyqs,
          uploadedAt: toBigInt(n.uploadedAt),
        }));
    },
    enabled: !!userId && subjectId !== null,
  });
}

export function useAddNote() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      subjectId: bigint;
      subjectName: string;
      title: string;
      content: string;
    }) => {
      const userId = currentUser?.username;
      if (!userId) throw new Error("Not logged in");
      const id = dataStore.addNote(
        userId,
        Number(data.subjectId),
        data.subjectName,
        data.title,
        data.content,
      );
      return toBigInt(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useUpdateNoteAI() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      noteId: bigint;
      aiSummary: string;
      aiKeyTopics: string;
      aiShortNotes: string;
      aiPyqs: string;
    }) => {
      const userId = currentUser?.username;
      if (!userId) throw new Error("Not logged in");
      dataStore.updateNoteAI(
        userId,
        Number(data.noteId),
        data.aiSummary,
        data.aiKeyTopics,
        data.aiShortNotes,
        data.aiPyqs,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useDeleteNote() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: bigint) => {
      const userId = currentUser?.username;
      if (!userId) throw new Error("Not logged in");
      dataStore.deleteNote(userId, Number(noteId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export function useDashboardStats() {
  const { currentUser } = useAuth();
  const userId = currentUser?.username ?? "";

  return useQuery({
    queryKey: ["dashboardStats", userId],
    queryFn: async () => {
      if (!userId)
        return {
          todayAttendanceCount: BigInt(0),
          pendingTasksCount: BigInt(0),
          totalNotes: BigInt(0),
          taskStreak: BigInt(0),
        };
      const stats = dataStore.getDashboardStats(userId);
      return {
        todayAttendanceCount: toBigInt(stats.todayAttendanceCount),
        pendingTasksCount: toBigInt(stats.pendingTasksCount),
        totalNotes: toBigInt(stats.totalNotes),
        taskStreak: toBigInt(stats.taskStreak),
      };
    },
    enabled: !!userId,
  });
}
