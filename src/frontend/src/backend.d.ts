import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Note {
    id: bigint;
    title: string;
    content: string;
    subjectName: string;
    aiPyqs: string;
    aiKeyTopics: string;
    subjectId: bigint;
    aiSummary: string;
    aiShortNotes: string;
    uploadedAt: bigint;
}
export interface Task {
    id: bigint;
    title: string;
    subjectName: string;
    createdAt: bigint;
    completed: boolean;
    dueDate: string;
    priority: string;
}
export interface TaskEntry {
    principal: Principal;
    task: Task;
}
export interface DashboardStats {
    taskStreak: bigint;
    todayAttendanceCount: bigint;
    pendingTasksCount: bigint;
    totalNotes: bigint;
}
export interface UserEntry {
    principal: Principal;
    profile: UserProfile;
}
export interface SubjectEntry {
    principal: Principal;
    subject: Subject;
}
export interface AttendanceRecord {
    id: bigint;
    subjectName: string;
    date: string;
    createdAt: bigint;
    attended: boolean;
    subjectId: bigint;
    topicCovered: string;
}
export interface AttendanceEntry {
    principal: Principal;
    record: AttendanceRecord;
}
export interface Subject {
    id: bigint;
    name: string;
    createdAt: bigint;
    level: string;
}
export interface UserProfile {
    subjects: Array<string>;
    name: string;
    level: string;
    educationClass?: string;
}
export interface NoteEntry {
    principal: Principal;
    note: Note;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addNote(subjectId: bigint, subjectName: string, title: string, content: string): Promise<bigint>;
    addSubject(name: string): Promise<bigint>;
    addTask(title: string, subjectName: string, dueDate: string, priority: string): Promise<bigint>;
    adminDeleteAttendance(user: Principal, recordId: bigint): Promise<void>;
    adminDeleteNote(user: Principal, noteId: bigint): Promise<void>;
    adminDeleteSubject(user: Principal, subjectId: bigint): Promise<void>;
    adminDeleteTask(user: Principal, taskId: bigint): Promise<void>;
    adminGetAllAttendance(): Promise<Array<AttendanceEntry>>;
    adminGetAllNotes(): Promise<Array<NoteEntry>>;
    adminGetAllSubjects(): Promise<Array<SubjectEntry>>;
    adminGetAllTasks(): Promise<Array<TaskEntry>>;
    adminGetAllUsers(): Promise<Array<UserEntry>>;
    adminUpdateAttendance(user: Principal, recordId: bigint, topicCovered: string, attended: boolean): Promise<void>;
    adminUpdateNote(user: Principal, noteId: bigint, title: string, content: string, aiSummary: string): Promise<void>;
    adminUpdateTask(user: Principal, taskId: bigint, title: string, dueDate: string, priority: string, completed: boolean): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteNote(noteId: bigint): Promise<void>;
    deleteSubject(id: bigint): Promise<void>;
    deleteTask(taskId: bigint): Promise<void>;
    getAttendanceBySubject(subjectName: string): Promise<Array<AttendanceRecord>>;
    getAttendanceRecords(): Promise<Array<AttendanceRecord>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<DashboardStats>;
    getNotes(): Promise<Array<Note>>;
    getNotesBySubject(subjectId: bigint): Promise<Array<Note>>;
    getSubjects(): Promise<Array<Subject>>;
    getTaskStreak(): Promise<bigint>;
    getTasks(): Promise<Array<Task>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    logAttendance(subjectId: bigint, subjectName: string, date: string, topicCovered: string, attended: boolean): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setUserProfile(name: string, level: string, educationClass: string | null, subjects: Array<string>): Promise<void>;
    updateAttendanceRecord(recordId: bigint, topicCovered: string, attended: boolean): Promise<void>;
    updateNoteAI(noteId: bigint, aiSummary: string, aiKeyTopics: string, aiShortNotes: string, aiPyqs: string): Promise<void>;
    updateTaskStatus(taskId: bigint, completed: boolean): Promise<void>;
}
