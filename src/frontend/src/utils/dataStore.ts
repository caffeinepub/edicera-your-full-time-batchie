// ─── DataStore: localStorage-backed CRUD for all EDUCERA data ─────────────────
// All data is keyed by userId (username string).
// IDs are numbers; callers that need bigint can convert at the hook layer.

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  name: string;
  level: string;
  educationClass?: string;
  subjects: string[];
}

export interface Subject {
  id: number;
  name: string;
  level: string;
  createdAt: number;
}

export interface AttendanceRecord {
  id: number;
  subjectId: number;
  subjectName: string;
  date: string;
  topicCovered: string;
  attended: boolean;
  createdAt: number;
}

export interface Task {
  id: number;
  title: string;
  subjectName: string;
  dueDate: string;
  priority: string;
  completed: boolean;
  createdAt: number;
}

export interface Note {
  id: number;
  subjectId: number;
  subjectName: string;
  title: string;
  content: string;
  aiSummary: string;
  aiKeyTopics: string;
  aiShortNotes: string;
  aiPyqs: string;
  uploadedAt: number;
}

export interface DashboardStats {
  todayAttendanceCount: number;
  pendingTasksCount: number;
  totalNotes: number;
  taskStreak: number;
}

// ─── Key helpers ──────────────────────────────────────────────────────────────

const key = {
  profile: (userId: string) => `educera_data_${userId}_profile`,
  subjects: (userId: string) => `educera_data_${userId}_subjects`,
  attendance: (userId: string) => `educera_data_${userId}_attendance`,
  tasks: (userId: string) => `educera_data_${userId}_tasks`,
  notes: (userId: string) => `educera_data_${userId}_notes`,
  counter: (name: string) => `educera_counter_${name}`,
  // Index of all registered userIds for admin queries
  userIndex: () => "educera_user_index",
};

// ─── Storage helpers ──────────────────────────────────────────────────────────

function readJSON<T>(k: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(k: string, value: T): void {
  localStorage.setItem(k, JSON.stringify(value));
}

// ─── Auto-increment ID ────────────────────────────────────────────────────────

function nextId(name: string): number {
  const k = key.counter(name);
  const current = readJSON<number>(k, 0);
  const next = current + 1;
  writeJSON(k, next);
  return next;
}

// ─── User index helpers (for admin) ──────────────────────────────────────────

function registerUser(userId: string): void {
  const index = readJSON<string[]>(key.userIndex(), []);
  if (!index.includes(userId)) {
    writeJSON(key.userIndex(), [...index, userId]);
  }
}

function getAllUserIds(): string[] {
  return readJSON<string[]>(key.userIndex(), []);
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export function getUserProfile(userId: string): UserProfile | null {
  return readJSON<UserProfile | null>(key.profile(userId), null);
}

export function setUserProfile(
  userId: string,
  name: string,
  level: string,
  educationClass: string | null,
  subjects: string[],
): void {
  const profile: UserProfile = {
    name,
    level,
    subjects,
    ...(educationClass ? { educationClass } : {}),
  };
  writeJSON(key.profile(userId), profile);
  registerUser(userId);
}

// ─── Subjects ─────────────────────────────────────────────────────────────────

export function getSubjects(userId: string): Subject[] {
  return readJSON<Subject[]>(key.subjects(userId), []);
}

export function addSubject(userId: string, name: string): number {
  const subjects = getSubjects(userId);
  // Avoid duplicates
  const existing = subjects.find(
    (s) => s.name.toLowerCase() === name.toLowerCase(),
  );
  if (existing) return existing.id;
  const id = nextId("subject");
  const subject: Subject = {
    id,
    name,
    level: getUserProfile(userId)?.level ?? "Unknown",
    createdAt: Date.now(),
  };
  writeJSON(key.subjects(userId), [...subjects, subject]);
  registerUser(userId);
  return id;
}

export function deleteSubject(userId: string, id: number): void {
  const subjects = getSubjects(userId);
  writeJSON(
    key.subjects(userId),
    subjects.filter((s) => s.id !== id),
  );
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export function getAttendanceRecords(userId: string): AttendanceRecord[] {
  return readJSON<AttendanceRecord[]>(key.attendance(userId), []);
}

export function logAttendance(
  userId: string,
  subjectId: number,
  subjectName: string,
  date: string,
  topicCovered: string,
  attended: boolean,
): number {
  const records = getAttendanceRecords(userId);
  // Upsert: if same subject + date exists, update it
  const existingIdx = records.findIndex(
    (r) => r.subjectId === subjectId && r.date === date,
  );
  if (existingIdx !== -1) {
    const updated = [...records];
    updated[existingIdx] = {
      ...updated[existingIdx],
      topicCovered,
      attended,
      createdAt: Date.now(),
    };
    writeJSON(key.attendance(userId), updated);
    return updated[existingIdx].id;
  }
  const id = nextId("attendance");
  const record: AttendanceRecord = {
    id,
    subjectId,
    subjectName,
    date,
    topicCovered,
    attended,
    createdAt: Date.now(),
  };
  writeJSON(key.attendance(userId), [...records, record]);
  registerUser(userId);
  return id;
}

export function updateAttendanceRecord(
  userId: string,
  recordId: number,
  topicCovered: string,
  attended: boolean,
): void {
  const records = getAttendanceRecords(userId);
  writeJSON(
    key.attendance(userId),
    records.map((r) =>
      r.id === recordId
        ? { ...r, topicCovered, attended, createdAt: Date.now() }
        : r,
    ),
  );
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export function getTasks(userId: string): Task[] {
  return readJSON<Task[]>(key.tasks(userId), []);
}

export function addTask(
  userId: string,
  title: string,
  subjectName: string,
  dueDate: string,
  priority: string,
): number {
  const tasks = getTasks(userId);
  const id = nextId("task");
  const task: Task = {
    id,
    title,
    subjectName,
    dueDate,
    priority,
    completed: false,
    createdAt: Date.now(),
  };
  writeJSON(key.tasks(userId), [...tasks, task]);
  registerUser(userId);
  return id;
}

export function updateTaskStatus(
  userId: string,
  taskId: number,
  completed: boolean,
): void {
  const tasks = getTasks(userId);
  writeJSON(
    key.tasks(userId),
    tasks.map((t) => (t.id === taskId ? { ...t, completed } : t)),
  );
}

export function deleteTask(userId: string, taskId: number): void {
  const tasks = getTasks(userId);
  writeJSON(
    key.tasks(userId),
    tasks.filter((t) => t.id !== taskId),
  );
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export function getNotes(userId: string): Note[] {
  return readJSON<Note[]>(key.notes(userId), []);
}

export function getNotesBySubject(userId: string, subjectId: number): Note[] {
  return getNotes(userId).filter((n) => n.subjectId === subjectId);
}

export function addNote(
  userId: string,
  subjectId: number,
  subjectName: string,
  title: string,
  content: string,
): number {
  const notes = getNotes(userId);
  const id = nextId("note");
  const note: Note = {
    id,
    subjectId,
    subjectName,
    title,
    content,
    aiSummary: "",
    aiKeyTopics: "",
    aiShortNotes: "",
    aiPyqs: "",
    uploadedAt: Date.now(),
  };
  writeJSON(key.notes(userId), [...notes, note]);
  registerUser(userId);
  return id;
}

export function updateNoteAI(
  userId: string,
  noteId: number,
  aiSummary: string,
  aiKeyTopics: string,
  aiShortNotes: string,
  aiPyqs: string,
): void {
  const notes = getNotes(userId);
  writeJSON(
    key.notes(userId),
    notes.map((n) =>
      n.id === noteId
        ? { ...n, aiSummary, aiKeyTopics, aiShortNotes, aiPyqs }
        : n,
    ),
  );
}

export function deleteNote(userId: string, noteId: number): void {
  const notes = getNotes(userId);
  writeJSON(
    key.notes(userId),
    notes.filter((n) => n.id !== noteId),
  );
}

// ─── Task Streak ──────────────────────────────────────────────────────────────

export function getTaskStreak(userId: string): number {
  const tasks = getTasks(userId);
  if (tasks.length === 0) return 0;

  // Find consecutive days with at least one completed task (going back from today)
  const completedDates = new Set(
    tasks
      .filter((t) => t.completed)
      .map((t) => {
        const d = new Date(t.createdAt);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      }),
  );

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (completedDates.has(dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export function getDashboardStats(userId: string): DashboardStats {
  const today = new Date().toISOString().split("T")[0];
  const attendance = getAttendanceRecords(userId);
  const tasks = getTasks(userId);
  const notes = getNotes(userId);

  const todayAttendanceCount = attendance.filter(
    (r) => r.date === today && r.attended,
  ).length;
  const pendingTasksCount = tasks.filter((t) => !t.completed).length;
  const totalNotes = notes.length;
  const taskStreak = getTaskStreak(userId);

  return { todayAttendanceCount, pendingTasksCount, totalNotes, taskStreak };
}

// ─── Admin: get all data across all users ─────────────────────────────────────

export function getAllUsers(): { userId: string; profile: UserProfile }[] {
  return getAllUserIds()
    .map((userId) => {
      const profile = getUserProfile(userId);
      return profile ? { userId, profile } : null;
    })
    .filter((x): x is { userId: string; profile: UserProfile } => x !== null);
}

export function getAllAttendance(): {
  userId: string;
  record: AttendanceRecord;
}[] {
  return getAllUserIds().flatMap((userId) =>
    getAttendanceRecords(userId).map((record) => ({ userId, record })),
  );
}

export function getAllTasks(): { userId: string; task: Task }[] {
  return getAllUserIds().flatMap((userId) =>
    getTasks(userId).map((task) => ({ userId, task })),
  );
}

export function getAllNotes(): { userId: string; note: Note }[] {
  return getAllUserIds().flatMap((userId) =>
    getNotes(userId).map((note) => ({ userId, note })),
  );
}

export function getAllSubjects(): { userId: string; subject: Subject }[] {
  return getAllUserIds().flatMap((userId) =>
    getSubjects(userId).map((subject) => ({ userId, subject })),
  );
}

// ─── Admin: delete / update operations ───────────────────────────────────────

export function adminDeleteAttendance(userId: string, recordId: number): void {
  const records = getAttendanceRecords(userId);
  writeJSON(
    key.attendance(userId),
    records.filter((r) => r.id !== recordId),
  );
}

export function adminUpdateAttendance(
  userId: string,
  recordId: number,
  topicCovered: string,
  attended: boolean,
): void {
  updateAttendanceRecord(userId, recordId, topicCovered, attended);
}

export function adminDeleteTask(userId: string, taskId: number): void {
  deleteTask(userId, taskId);
}

export function adminUpdateTask(
  userId: string,
  taskId: number,
  title: string,
  dueDate: string,
  priority: string,
  completed: boolean,
): void {
  const tasks = getTasks(userId);
  writeJSON(
    key.tasks(userId),
    tasks.map((t) =>
      t.id === taskId ? { ...t, title, dueDate, priority, completed } : t,
    ),
  );
}

export function adminDeleteNote(userId: string, noteId: number): void {
  deleteNote(userId, noteId);
}

export function adminUpdateNote(
  userId: string,
  noteId: number,
  title: string,
  content: string,
  aiSummary: string,
): void {
  const notes = getNotes(userId);
  writeJSON(
    key.notes(userId),
    notes.map((n) =>
      n.id === noteId ? { ...n, title, content, aiSummary } : n,
    ),
  );
}

export function adminDeleteSubject(userId: string, subjectId: number): void {
  deleteSubject(userId, subjectId);
}
