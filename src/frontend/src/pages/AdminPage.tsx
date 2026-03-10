import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Code2,
  Copy,
  Database,
  Edit2,
  FileCode,
  GraduationCap,
  LogOut,
  RefreshCw,
  Trash2,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import * as dataStore from "../utils/dataStore";

// ─── Local types (localStorage-flavored) ─────────────────────────────────────

type UserEntry = { userId: string; profile: dataStore.UserProfile };
type AttendanceEntry = {
  userId: string;
  record: dataStore.AttendanceRecord;
};
type TaskEntry = { userId: string; task: dataStore.Task };
type NoteEntry = { userId: string; note: dataStore.Note };
type SubjectEntry = { userId: string; subject: dataStore.Subject };

// ─── Motoko source files (embedded) ──────────────────────────────────────────
const MOTOKO_FILES: { name: string; path: string; source: string }[] = [
  {
    name: "main.mo",
    path: "src/backend/main.mo",
    source: `import Map "mo:core/Map";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Migration "migration";

// Data migration via with-clause. Migration code is in separate file.
(with migration = Migration.run)
actor {
  include MixinStorage();

  // Include authorization mixin
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type UserProfile = {
    name : Text;
    level : Text;
    class_ : ?Text;
    subjects : [Text];
  };

  public type Subject = {
    id : Nat;
    name : Text;
    level : Text;
    createdAt : Int;
  };

  public type AttendanceRecord = {
    id : Nat;
    subjectId : Nat;
    subjectName : Text;
    date : Text;
    topicCovered : Text;
    attended : Bool;
    createdAt : Int;
  };

  public type Task = {
    id : Nat;
    title : Text;
    subjectName : Text;
    dueDate : Text;
    priority : Text;
    completed : Bool;
    createdAt : Int;
  };

  public type Note = {
    id : Nat;
    subjectId : Nat;
    subjectName : Text;
    title : Text;
    content : Text;
    aiSummary : Text;
    aiKeyTopics : Text;
    aiShortNotes : Text;
    aiPyqs : Text;
    uploadedAt : Int;
  };

  // Data Stores
  let userProfiles = Map.empty<Principal, UserProfile>();
  let subjects = Map.empty<Principal, Map.Map<Nat, Subject>>();
  let attendanceRecords = Map.empty<Principal, Map.Map<Nat, AttendanceRecord>>();
  let tasks = Map.empty<Principal, Map.Map<Nat, Task>>();
  let notes = Map.empty<Principal, Map.Map<Nat, Note>>();

  var subjectIdCounter = 1;
  var attendanceIdCounter = 1;
  var taskIdCounter = 1;
  var noteIdCounter = 1;

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public shared ({ caller }) func setUserProfile(
    name : Text, level : Text, educationClass : ?Text, subjects : [Text]
  ) : async () {
    userProfiles.add(caller, { name; level; class_ = educationClass; subjects });
  };

  // Subject Functions
  public shared ({ caller }) func addSubject(name : Text) : async Nat {
    let newId = subjectIdCounter;
    subjectIdCounter += 1;
    let subject : Subject = {
      id = newId;
      name;
      level = "Unknown";
      createdAt = Time.now();
    };
    let userSubjects = switch (subjects.get(caller)) {
      case (null) { Map.empty<Nat, Subject>() };
      case (?existing) { existing };
    };
    userSubjects.add(newId, subject);
    subjects.add(caller, userSubjects);
    newId;
  };

  // Attendance Functions (upsert)
  public shared ({ caller }) func logAttendance(
    subjectId : Nat, subjectName : Text,
    date : Text, topicCovered : Text, attended : Bool
  ) : async Nat {
    let userRecords = switch (attendanceRecords.get(caller)) {
      case (null) { Map.empty<Nat, AttendanceRecord>() };
      case (?existing) { existing };
    };
    var existingId : ?Nat = null;
    for (entry in userRecords.entries()) {
      let (_, record) = entry;
      if (record.subjectId == subjectId and record.date == date) {
        existingId := ?record.id;
        userRecords.add(record.id, { record with topicCovered; attended; createdAt = Time.now() });
      };
    };
    switch (existingId) {
      case (?id) { return id };
      case (null) {};
    };
    let newId = attendanceIdCounter;
    attendanceIdCounter += 1;
    let record : AttendanceRecord = {
      id = newId; subjectId; subjectName; date;
      topicCovered; attended; createdAt = Time.now();
    };
    userRecords.add(newId, record);
    attendanceRecords.add(caller, userRecords);
    newId;
  };
};`,
  },
  {
    name: "MixinAuthorization.mo",
    path: "src/backend/authorization/MixinAuthorization.mo",
    source: `import AccessControl "./access-control";
import Prim "mo:prim";
import Runtime "mo:core/Runtime";

mixin (accessControlState : AccessControl.AccessControlState) {
  public shared ({ caller }) func _initializeAccessControlWithSecret(userSecret : Text) : async () {
    switch (Prim.envVar<system>("CAFFEINE_ADMIN_TOKEN")) {
      case (null) {
        Runtime.trap("CAFFEINE_ADMIN_TOKEN environment variable is not set");
      };
      case (?adminToken) {
        AccessControl.initialize(accessControlState, caller, adminToken, userSecret);
      };
    };
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };
};`,
  },
  {
    name: "access-control.mo",
    path: "src/backend/authorization/access-control.mo",
    source: `import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

module {
  public type UserRole = {
    #admin;
    #user;
    #guest;
  };

  public type AccessControlState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, UserRole>;
  };

  public func initState() : AccessControlState {
    {
      var adminAssigned = false;
      userRoles = Map.empty<Principal, UserRole>();
    };
  };

  public func initialize(state : AccessControlState, caller : Principal, adminToken : Text, userProvidedToken : Text) {
    if (caller.isAnonymous()) { return };
    switch (state.userRoles.get(caller)) {
      case (?_) {};
      case (null) {
        if (not state.adminAssigned and userProvidedToken == adminToken) {
          state.userRoles.add(caller, #admin);
          state.adminAssigned := true;
        } else {
          state.userRoles.add(caller, #user);
        };
      };
    };
  };

  public func getUserRole(state : AccessControlState, caller : Principal) : UserRole {
    if (caller.isAnonymous()) { return #guest };
    switch (state.userRoles.get(caller)) {
      case (?role) { role };
      case (null) { Runtime.trap("User is not registered") };
    };
  };

  public func hasPermission(state : AccessControlState, caller : Principal, requiredRole : UserRole) : Bool {
    let userRole = getUserRole(state, caller);
    if (userRole == #admin or requiredRole == #guest) { true } else {
      userRole == requiredRole;
    };
  };

  public func isAdmin(state : AccessControlState, caller : Principal) : Bool {
    getUserRole(state, caller) == #admin;
  };
};`,
  },
  {
    name: "Mixin.mo",
    path: "src/backend/blob-storage/Mixin.mo",
    source: `import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Storage "Storage";
import Prim "mo:prim";
import Runtime "mo:core/Runtime";

mixin () {
  type ExternalBlob = Storage.ExternalBlob;
  transient let _caffeineStorageState : Storage.State = Storage.new();

  public shared ({ caller }) func _caffeineStorageRefillCashier(refillInformation : ?{ proposed_top_up_amount : ?Nat }) : async { success : ?Bool; topped_up_amount : ?Nat } {
    let cashier = await Storage.getCashierPrincipal();
    if (cashier != caller) { Runtime.trap("Unauthorized access") };
    await Storage.refillCashier(_caffeineStorageState, cashier, refillInformation);
  };

  public query ({ caller }) func _caffeineStorageBlobIsLive(hash : Blob) : async Bool {
    Prim.isStorageBlobLive(hash);
  };
};`,
  },
  {
    name: "Storage.mo",
    path: "src/backend/blob-storage/Storage.mo",
    source: `import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Prim "mo:prim";
import Cycles "mo:core/Cycles";
import Nat "mo:core/Nat";

module {
  public type ExternalBlob = Blob;

  public type State = {
    var authorizedPrincipals : [Principal];
  };

  public func new() : State {
    { var authorizedPrincipals = [] };
  };

  public func getCashierPrincipal() : async Principal {
    switch (Prim.envVar<system>("CAFFFEINE_STORAGE_CASHIER_PRINCIPAL")) {
      case (null) { Runtime.trap("CAFFFEINE_STORAGE_CASHIER_PRINCIPAL not set") };
      case (?p) { Principal.fromText(p) };
    };
  };

  public func isAuthorized(registry : State, caller : Principal) : Bool {
    registry.authorizedPrincipals.find(func(p) { Principal.equal(p, caller) }) != null;
  };

  public func refillCashier(
    _registry : State, cashier : Principal,
    refillInformation : ?{ proposed_top_up_amount : ?Nat },
  ) : async { success : ?Bool; topped_up_amount : ?Nat } {
    let currentBalance = Cycles.balance();
    let reservedCycles : Nat = 400_000_000_000;
    let currentFree : Nat = Nat.sub(currentBalance, reservedCycles);
    let cyclesToSend : Nat = switch (refillInformation) {
      case (null) { currentFree };
      case (?info) {
        switch (info.proposed_top_up_amount) {
          case (null) { currentFree };
          case (?proposed) { Nat.min(proposed, currentFree) };
        };
      };
    };
    let targetCanister = actor (cashier.toText()) : actor {
      account_top_up_v1 : ({ account : Principal }) -> async ();
    };
    await (with cycles = cyclesToSend) targetCanister.account_top_up_v1({ account = Prim.getSelfPrincipal<system>() });
    { success = ?true; topped_up_amount = ?cyclesToSend };
  };
};`,
  },
];

// ─── Helper utilities ─────────────────────────────────────────────────────────

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

function formatDate(ts: number): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── Reusable small components ────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 text-muted-foreground text-sm">
      <Database className="w-8 h-8 mx-auto mb-3 opacity-30" />
      {message}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const classes =
    priority === "High"
      ? "priority-high"
      : priority === "Medium"
        ? "priority-medium"
        : "priority-low";
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${classes}`}
    >
      {priority}
    </span>
  );
}

function StatusBadge({ completed }: { completed: boolean }) {
  return completed ? (
    <span className="text-xs px-2 py-0.5 rounded-full font-semibold attended-badge">
      Complete
    </span>
  ) : (
    <span className="text-xs px-2 py-0.5 rounded-full font-semibold absent-badge">
      Pending
    </span>
  );
}

function AttendedBadge({ attended }: { attended: boolean }) {
  return attended ? (
    <span className="text-xs px-2 py-0.5 rounded-full font-semibold attended-badge">
      Present
    </span>
  ) : (
    <span className="text-xs px-2 py-0.5 rounded-full font-semibold absent-badge">
      Absent
    </span>
  );
}

function SectionHeader({
  title,
  count,
  onRefresh,
  loading,
}: {
  title: string;
  count: number;
  onRefresh: () => void;
  loading: boolean;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-display font-bold text-lg">
        {title}{" "}
        <span className="text-sm font-normal text-muted-foreground ml-1">
          ({count})
        </span>
      </h2>
      <Button
        size="sm"
        variant="ghost"
        onClick={onRefresh}
        disabled={loading}
        className="text-muted-foreground hover:text-foreground gap-1.5"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        Refresh
      </Button>
    </div>
  );
}

function AdminTable({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border/50">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/50 bg-card/60">
            {headers.map((h) => (
              <th
                key={h}
                className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function TR({ children, index }: { children: React.ReactNode; index: number }) {
  return (
    <tr
      className={`border-b border-border/30 transition-colors hover:bg-primary/5 ${
        index % 2 === 0 ? "bg-background/30" : "bg-card/20"
      }`}
    >
      {children}
    </tr>
  );
}

function TD({
  children,
  className = "",
}: { children: React.ReactNode; className?: string }) {
  return <td className={`py-3 px-4 align-middle ${className}`}>{children}</td>;
}

// ─── Tab: Users ───────────────────────────────────────────────────────────────

function UsersTab() {
  const [data, setData] = useState<UserEntry[]>(() => dataStore.getAllUsers());
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setData(dataStore.getAllUsers());
    setLoading(false);
  }, []);

  return (
    <>
      <SectionHeader
        title="Users"
        count={data.length}
        onRefresh={load}
        loading={loading}
      />
      {data.length === 0 ? (
        <EmptyState message="No users registered yet." />
      ) : (
        <AdminTable
          headers={["Username", "Name", "Level", "Class/Course", "Subjects"]}
        >
          {data.map((entry, i) => (
            <TR key={entry.userId} index={i}>
              <TD>
                <code className="text-xs text-primary/80 font-mono">
                  {truncate(entry.userId, 24)}
                </code>
              </TD>
              <TD className="font-medium">{entry.profile.name || "—"}</TD>
              <TD>{entry.profile.level || "—"}</TD>
              <TD>{entry.profile.educationClass || "—"}</TD>
              <TD className="text-muted-foreground text-xs">
                {entry.profile.subjects?.join(", ") || "—"}
              </TD>
            </TR>
          ))}
        </AdminTable>
      )}
    </>
  );
}

// ─── Tab: Attendance ──────────────────────────────────────────────────────────

function AttendanceTab() {
  const [data, setData] = useState<AttendanceEntry[]>(() =>
    dataStore.getAllAttendance(),
  );
  const [loading, setLoading] = useState(false);
  const [editEntry, setEditEntry] = useState<AttendanceEntry | null>(null);
  const [editTopic, setEditTopic] = useState("");
  const [editAttended, setEditAttended] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setData(dataStore.getAllAttendance());
    setLoading(false);
  }, []);

  const openEdit = (entry: AttendanceEntry) => {
    setEditEntry(entry);
    setEditTopic(entry.record.topicCovered);
    setEditAttended(entry.record.attended);
  };

  const handleSave = () => {
    if (!editEntry) return;
    setSaving(true);
    try {
      dataStore.adminUpdateAttendance(
        editEntry.userId,
        editEntry.record.id,
        editTopic,
        editAttended,
      );
      toast.success("Attendance updated");
      setEditEntry(null);
      load();
    } catch (e) {
      toast.error(`Failed: ${e}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (entry: AttendanceEntry) => {
    if (!window.confirm("Delete this attendance record?")) return;
    try {
      dataStore.adminDeleteAttendance(entry.userId, entry.record.id);
      toast.success("Record deleted");
      load();
    } catch (e) {
      toast.error(`Failed: ${e}`);
    }
  };

  return (
    <>
      <SectionHeader
        title="Attendance Records"
        count={data.length}
        onRefresh={load}
        loading={loading}
      />
      {data.length === 0 ? (
        <EmptyState message="No attendance records found." />
      ) : (
        <AdminTable
          headers={[
            "User",
            "Subject",
            "Date",
            "Topic Covered",
            "Status",
            "Actions",
          ]}
        >
          {data.map((entry, i) => (
            <TR key={`${entry.userId}-${entry.record.id}`} index={i}>
              <TD>
                <code className="text-xs text-primary/80 font-mono">
                  {truncate(entry.userId, 18)}
                </code>
              </TD>
              <TD className="font-medium">{entry.record.subjectName}</TD>
              <TD className="text-muted-foreground">{entry.record.date}</TD>
              <TD className="max-w-[200px]">
                {truncate(entry.record.topicCovered, 40) || "—"}
              </TD>
              <TD>
                <AttendedBadge attended={entry.record.attended} />
              </TD>
              <TD>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-primary/70 hover:text-primary"
                    onClick={() => openEdit(entry)}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-destructive/70 hover:text-destructive"
                    onClick={() => handleDelete(entry)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </TD>
            </TR>
          ))}
        </AdminTable>
      )}

      <Dialog
        open={!!editEntry}
        onOpenChange={(open) => !open && setEditEntry(null)}
      >
        <DialogContent className="bg-card border-border/60 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Attendance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                Topic Covered
              </Label>
              <Input
                value={editTopic}
                onChange={(e) => setEditTopic(e.target.value)}
                placeholder="e.g. Trigonometry"
                className="bg-background border-border/60"
              />
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="attended"
                checked={editAttended}
                onCheckedChange={(v) => setEditAttended(!!v)}
              />
              <Label htmlFor="attended" className="cursor-pointer">
                Attended
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditEntry(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Tab: Tasks ───────────────────────────────────────────────────────────────

function TasksTab() {
  const [data, setData] = useState<TaskEntry[]>(() => dataStore.getAllTasks());
  const [loading, setLoading] = useState(false);
  const [editEntry, setEditEntry] = useState<TaskEntry | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDue, setEditDue] = useState("");
  const [editPriority, setEditPriority] = useState("Medium");
  const [editCompleted, setEditCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setData(dataStore.getAllTasks());
    setLoading(false);
  }, []);

  const openEdit = (entry: TaskEntry) => {
    setEditEntry(entry);
    setEditTitle(entry.task.title);
    setEditDue(entry.task.dueDate);
    setEditPriority(entry.task.priority);
    setEditCompleted(entry.task.completed);
  };

  const handleSave = () => {
    if (!editEntry) return;
    setSaving(true);
    try {
      dataStore.adminUpdateTask(
        editEntry.userId,
        editEntry.task.id,
        editTitle,
        editDue,
        editPriority,
        editCompleted,
      );
      toast.success("Task updated");
      setEditEntry(null);
      load();
    } catch (e) {
      toast.error(`Failed: ${e}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (entry: TaskEntry) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      dataStore.adminDeleteTask(entry.userId, entry.task.id);
      toast.success("Task deleted");
      load();
    } catch (e) {
      toast.error(`Failed: ${e}`);
    }
  };

  return (
    <>
      <SectionHeader
        title="Tasks"
        count={data.length}
        onRefresh={load}
        loading={loading}
      />
      {data.length === 0 ? (
        <EmptyState message="No tasks found." />
      ) : (
        <AdminTable
          headers={[
            "User",
            "Title",
            "Due Date",
            "Priority",
            "Status",
            "Actions",
          ]}
        >
          {data.map((entry, i) => (
            <TR key={`${entry.userId}-${entry.task.id}`} index={i}>
              <TD>
                <code className="text-xs text-primary/80 font-mono">
                  {truncate(entry.userId, 18)}
                </code>
              </TD>
              <TD className="font-medium max-w-[180px]">
                {truncate(entry.task.title, 35)}
              </TD>
              <TD className="text-muted-foreground">{entry.task.dueDate}</TD>
              <TD>
                <PriorityBadge priority={entry.task.priority} />
              </TD>
              <TD>
                <StatusBadge completed={entry.task.completed} />
              </TD>
              <TD>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-primary/70 hover:text-primary"
                    onClick={() => openEdit(entry)}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-destructive/70 hover:text-destructive"
                    onClick={() => handleDelete(entry)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </TD>
            </TR>
          ))}
        </AdminTable>
      )}

      <Dialog
        open={!!editEntry}
        onOpenChange={(open) => !open && setEditEntry(null)}
      >
        <DialogContent className="bg-card border-border/60 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                Title
              </Label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="bg-background border-border/60"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                Due Date
              </Label>
              <Input
                type="date"
                value={editDue}
                onChange={(e) => setEditDue(e.target.value)}
                className="bg-background border-border/60"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                Priority
              </Label>
              <Select value={editPriority} onValueChange={setEditPriority}>
                <SelectTrigger className="bg-background border-border/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="completed"
                checked={editCompleted}
                onCheckedChange={(v) => setEditCompleted(!!v)}
              />
              <Label htmlFor="completed" className="cursor-pointer">
                Completed
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditEntry(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Tab: Notes ───────────────────────────────────────────────────────────────

function NotesTab() {
  const [data, setData] = useState<NoteEntry[]>(() => dataStore.getAllNotes());
  const [loading, setLoading] = useState(false);
  const [editEntry, setEditEntry] = useState<NoteEntry | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setData(dataStore.getAllNotes());
    setLoading(false);
  }, []);

  const openEdit = (entry: NoteEntry) => {
    setEditEntry(entry);
    setEditTitle(entry.note.title);
    setEditContent(entry.note.content);
    setEditSummary(entry.note.aiSummary);
  };

  const handleSave = () => {
    if (!editEntry) return;
    setSaving(true);
    try {
      dataStore.adminUpdateNote(
        editEntry.userId,
        editEntry.note.id,
        editTitle,
        editContent,
        editSummary,
      );
      toast.success("Note updated");
      setEditEntry(null);
      load();
    } catch (e) {
      toast.error(`Failed: ${e}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (entry: NoteEntry) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      dataStore.adminDeleteNote(entry.userId, entry.note.id);
      toast.success("Note deleted");
      load();
    } catch (e) {
      toast.error(`Failed: ${e}`);
    }
  };

  return (
    <>
      <SectionHeader
        title="Notes"
        count={data.length}
        onRefresh={load}
        loading={loading}
      />
      {data.length === 0 ? (
        <EmptyState message="No notes found." />
      ) : (
        <AdminTable
          headers={[
            "User",
            "Subject",
            "Title",
            "Content Preview",
            "AI Summary",
            "Actions",
          ]}
        >
          {data.map((entry, i) => (
            <TR key={`${entry.userId}-${entry.note.id}`} index={i}>
              <TD>
                <code className="text-xs text-primary/80 font-mono">
                  {truncate(entry.userId, 18)}
                </code>
              </TD>
              <TD className="font-medium">{entry.note.subjectName}</TD>
              <TD>{truncate(entry.note.title, 30)}</TD>
              <TD className="text-muted-foreground text-xs max-w-[160px]">
                {truncate(entry.note.content, 60) || "—"}
              </TD>
              <TD className="text-muted-foreground text-xs max-w-[160px]">
                {truncate(entry.note.aiSummary, 50) || "—"}
              </TD>
              <TD>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-primary/70 hover:text-primary"
                    onClick={() => openEdit(entry)}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-destructive/70 hover:text-destructive"
                    onClick={() => handleDelete(entry)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </TD>
            </TR>
          ))}
        </AdminTable>
      )}

      <Dialog
        open={!!editEntry}
        onOpenChange={(open) => !open && setEditEntry(null)}
      >
        <DialogContent className="bg-card border-border/60 max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                Title
              </Label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="bg-background border-border/60"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                Content
              </Label>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={4}
                className="bg-background border-border/60 resize-none"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                AI Summary
              </Label>
              <Textarea
                value={editSummary}
                onChange={(e) => setEditSummary(e.target.value)}
                rows={3}
                className="bg-background border-border/60 resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditEntry(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Tab: Subjects ────────────────────────────────────────────────────────────

function SubjectsTab() {
  const [data, setData] = useState<SubjectEntry[]>(() =>
    dataStore.getAllSubjects(),
  );
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setData(dataStore.getAllSubjects());
    setLoading(false);
  }, []);

  const handleDelete = (entry: SubjectEntry) => {
    if (!window.confirm("Delete this subject?")) return;
    try {
      dataStore.adminDeleteSubject(entry.userId, entry.subject.id);
      toast.success("Subject deleted");
      load();
    } catch (e) {
      toast.error(`Failed: ${e}`);
    }
  };

  return (
    <>
      <SectionHeader
        title="Subjects"
        count={data.length}
        onRefresh={load}
        loading={loading}
      />
      {data.length === 0 ? (
        <EmptyState message="No subjects found." />
      ) : (
        <AdminTable
          headers={["User", "Subject Name", "Level", "Created At", "Actions"]}
        >
          {data.map((entry, i) => (
            <TR key={`${entry.userId}-${entry.subject.id}`} index={i}>
              <TD>
                <code className="text-xs text-primary/80 font-mono">
                  {truncate(entry.userId, 18)}
                </code>
              </TD>
              <TD className="font-medium">{entry.subject.name}</TD>
              <TD>{entry.subject.level}</TD>
              <TD className="text-muted-foreground">
                {formatDate(entry.subject.createdAt)}
              </TD>
              <TD>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-destructive/70 hover:text-destructive"
                  onClick={() => handleDelete(entry)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </TD>
            </TR>
          ))}
        </AdminTable>
      )}
    </>
  );
}

// ─── Tab: Code Viewer ─────────────────────────────────────────────────────────

function CodeViewerTab() {
  const [activeFile, setActiveFile] = useState(0);
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);

  const currentFile = MOTOKO_FILES[activeFile];
  const lines = currentFile.source.split("\n");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentFile.source);
      setCopied(true);
      toast.success("Code copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display font-bold text-lg flex items-center gap-2">
            <FileCode className="w-5 h-5 text-primary" />
            Backend Source Code
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {currentFile.path} · Motoko · {lines.length} lines
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopy}
          className="gap-2 border-border/60 hover:border-primary/40"
        >
          <Copy className="w-3.5 h-3.5" />
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>

      {/* File selector tabs */}
      <div className="flex gap-1 flex-wrap mb-3 bg-muted/30 border border-border/40 p-1 rounded-xl">
        {MOTOKO_FILES.map((file, idx) => (
          <button
            key={file.name}
            type="button"
            onClick={() => {
              setActiveFile(idx);
              setCopied(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-150 ${
              activeFile === idx
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/60"
            }`}
          >
            {file.name}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="bg-[oklch(0.08_0.018_264)] px-4 py-2 border-b border-border/40 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/70" />
          <div className="w-3 h-3 rounded-full bg-amber-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
          <span className="text-xs text-muted-foreground ml-2 font-mono">
            {currentFile.name}
          </span>
        </div>
        <div className="overflow-auto max-h-[600px]">
          <pre
            ref={codeRef}
            className="text-xs font-mono p-0 m-0 bg-[oklch(0.09_0.018_264)]"
          >
            <table className="w-full border-collapse">
              <tbody>
                {lines.map((line, idx) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: line numbers are stable indices
                  <tr key={idx} className="hover:bg-primary/5">
                    <td className="select-none w-12 text-right pr-4 pl-3 py-0 text-muted-foreground/40 text-xs border-r border-border/20 leading-5">
                      {idx + 1}
                    </td>
                    <td className="pl-4 pr-4 py-0 leading-5 text-foreground/80 whitespace-pre">
                      {line || " "}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </pre>
        </div>
      </div>
    </>
  );
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

type TabId = "users" | "attendance" | "tasks" | "notes" | "subjects" | "code";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "users", label: "Users", icon: Users },
  { id: "attendance", label: "Attendance", icon: Database },
  { id: "tasks", label: "Tasks", icon: Database },
  { id: "notes", label: "Notes", icon: Database },
  { id: "subjects", label: "Subjects", icon: Database },
  { id: "code", label: "Code Viewer", icon: Code2 },
];

// ─── Main AdminPage ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabId>("users");
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 grid-texture opacity-10 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-20 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="font-display font-extrabold gradient-text-blue text-sm">
                EDUCERA
              </span>
              <span className="text-muted-foreground text-sm ml-1.5">
                Admin Panel
              </span>
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleLogout}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Tab navigation */}
        <div className="flex gap-1 flex-wrap mb-6 bg-card/40 border border-border/40 p-1 rounded-xl w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/60"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="glass rounded-2xl border border-border/50 p-6"
          >
            {activeTab === "users" && <UsersTab />}
            {activeTab === "attendance" && <AttendanceTab />}
            {activeTab === "tasks" && <TasksTab />}
            {activeTab === "notes" && <NotesTab />}
            {activeTab === "subjects" && <SubjectsTab />}
            {activeTab === "code" && <CodeViewerTab />}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
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
    </div>
  );
}
