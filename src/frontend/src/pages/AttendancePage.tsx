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
import { Switch } from "@/components/ui/switch";
import {
  Calendar,
  CheckCircle2,
  Info,
  Loader2,
  Pencil,
  PlusCircle,
  Save,
  X,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Subject } from "../backend-shim.d.ts";

const SUBJECT_SKELETON_IDS = ["sub-sk-1", "sub-sk-2", "sub-sk-3"];
const RECORD_SKELETON_IDS = [
  "rec-sk-1",
  "rec-sk-2",
  "rec-sk-3",
  "rec-sk-4",
  "rec-sk-5",
];
import {
  useAttendanceRecords,
  useLogAttendance,
  useSubjects,
  useUpdateAttendanceRecord,
} from "../hooks/useQueries";

function getTodayDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDisplayDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface AttendanceFormProps {
  subjects: Subject[];
  onSuccess: () => void;
}

function AttendanceForm({ subjects, onSuccess }: AttendanceFormProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [date, setDate] = useState(getTodayDateString());
  const [topic, setTopic] = useState("");
  const [attended, setAttended] = useState(true);
  const logAttendance = useLogAttendance();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) {
      toast.error("Please select a subject");
      return;
    }
    if (!topic.trim()) {
      toast.error("Please enter the topic covered");
      return;
    }

    const subject = subjects.find((s) => s.id.toString() === selectedSubjectId);
    if (!subject) return;

    try {
      await logAttendance.mutateAsync({
        subjectId: subject.id,
        subjectName: subject.name,
        date,
        topicCovered: topic.trim(),
        attended,
      });
      toast.success(`Attendance logged for ${subject.name}`);
      setTopic("");
      setAttended(true);
      onSuccess();
    } catch {
      toast.error("Failed to log attendance. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Upsert info note */}
      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-amber-400/5 border border-amber-400/15 rounded-lg px-3 py-2">
        <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
        <span>
          Logging the same subject on the same day will{" "}
          <strong className="text-foreground/80">update</strong> the existing
          record — no duplicates.
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Subject</Label>
          <Select
            value={selectedSubjectId}
            onValueChange={setSelectedSubjectId}
          >
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Select subject..." />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s.id.toString()} value={s.id.toString()}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="attendance-date">Date</Label>
          <Input
            id="attendance-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-background border-border"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="topic">Topic Covered</Label>
        <Input
          id="topic"
          placeholder="e.g. Chapter 4: Trigonometry — Introduction"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="bg-background border-border"
        />
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/60">
        <div>
          <div className="font-medium text-sm">Attendance Status</div>
          <div className="text-xs text-muted-foreground">
            Did you attend this class?
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-medium ${attended ? "text-success" : "text-destructive"}`}
          >
            {attended ? "Present" : "Absent"}
          </span>
          <Switch checked={attended} onCheckedChange={setAttended} />
        </div>
      </div>

      <Button
        type="submit"
        disabled={logAttendance.isPending}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {logAttendance.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Logging...
          </>
        ) : (
          <>
            <PlusCircle className="w-4 h-4 mr-2" />
            Log Attendance
          </>
        )}
      </Button>
    </form>
  );
}

interface EditRowProps {
  recordId: bigint;
  initialTopic: string;
  initialAttended: boolean;
  onCancel: () => void;
  onSaved: () => void;
}

function EditRow({
  recordId,
  initialTopic,
  initialAttended,
  onCancel,
  onSaved,
}: EditRowProps) {
  const [topic, setTopic] = useState(initialTopic);
  const [attended, setAttended] = useState(initialAttended);
  const updateRecord = useUpdateAttendanceRecord();

  const handleSave = async () => {
    if (!topic.trim()) {
      toast.error("Topic cannot be empty");
      return;
    }
    try {
      await updateRecord.mutateAsync({
        recordId,
        topicCovered: topic.trim(),
        attended,
      });
      toast.success("Attendance updated!");
      onSaved();
    } catch {
      toast.error("Failed to update attendance");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3.5 rounded-lg bg-primary/5 border border-primary/20 space-y-3"
    >
      <div className="space-y-1.5">
        <Label className="text-xs">Topic Covered</Label>
        <Input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="bg-background border-border h-8 text-sm"
          autoFocus
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-medium ${attended ? "text-success" : "text-destructive"}`}
          >
            {attended ? "Present" : "Absent"}
          </span>
          <Switch
            checked={attended}
            onCheckedChange={setAttended}
            className="scale-90"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={updateRecord.isPending}
            className="h-7 px-2.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {updateRecord.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <>
                <Save className="w-3 h-3 mr-1" />
                Save
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
            disabled={updateRecord.isPending}
            className="h-7 px-2.5 text-xs border-border"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function AttendancePage() {
  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects();
  const { data: records = [], isLoading: recordsLoading } =
    useAttendanceRecords();
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  // Compute per-subject summary
  const subjectSummary = subjects.map((sub) => {
    const subRecords = records.filter((r) => r.subjectName === sub.name);
    const attended = subRecords.filter((r) => r.attended).length;
    return { name: sub.name, attended, total: subRecords.length };
  });

  // Sort records by date descending
  const sortedRecords = [...records].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto pb-24 md:pb-8">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <Calendar className="w-7 h-7 text-amber-400" />
          Attendance
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your daily class attendance
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Log form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="bg-card border border-border/60 rounded-xl p-5">
            <h2 className="font-display font-semibold mb-4">Log Attendance</h2>
            {subjectsLoading ? (
              <div className="space-y-3">
                {SUBJECT_SKELETON_IDS.map((id) => (
                  <Skeleton key={id} className="h-10 skeleton-shimmer" />
                ))}
              </div>
            ) : subjects.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Add subjects first from the Subjects tab.
              </p>
            ) : (
              <AttendanceForm subjects={subjects} onSuccess={() => {}} />
            )}
          </div>

          {/* Subject Summary */}
          {subjectSummary.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border/60 rounded-xl p-5 mt-4"
            >
              <h2 className="font-display font-semibold mb-4">
                Subject Summary
              </h2>
              <div className="space-y-3">
                {subjectSummary.map(({ name, attended, total }) => {
                  const pct =
                    total > 0 ? Math.round((attended / total) * 100) : 0;
                  return (
                    <div key={name} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium truncate mr-2">
                          {name}
                        </span>
                        <span
                          className={`text-xs shrink-0 ${pct >= 75 ? "text-success" : pct > 0 ? "text-warning" : "text-muted-foreground"}`}
                        >
                          {attended}/{total} ({pct}%)
                        </span>
                      </div>
                      <div className="h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            background:
                              pct >= 75
                                ? "oklch(0.7 0.15 145)"
                                : pct > 0
                                  ? "oklch(0.78 0.16 82)"
                                  : "transparent",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Records list */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2"
        >
          <div className="bg-card border border-border/60 rounded-xl p-5">
            <h2 className="font-display font-semibold mb-4">
              Attendance History
            </h2>

            {recordsLoading ? (
              <div className="space-y-3">
                {RECORD_SKELETON_IDS.map((id) => (
                  <Skeleton
                    key={id}
                    className="h-16 rounded-lg skeleton-shimmer"
                  />
                ))}
              </div>
            ) : sortedRecords.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📅</div>
                <div className="font-display font-semibold text-lg">
                  No records yet
                </div>
                <div className="text-muted-foreground text-sm mt-1">
                  Start logging your attendance using the form
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                {sortedRecords.map((record, i) => {
                  const recordIdStr = record.id.toString();
                  const isEditing = editingRecordId === recordIdStr;

                  return (
                    <motion.div
                      key={recordIdStr}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      {isEditing ? (
                        <EditRow
                          recordId={record.id}
                          initialTopic={record.topicCovered}
                          initialAttended={record.attended}
                          onCancel={() => setEditingRecordId(null)}
                          onSaved={() => setEditingRecordId(null)}
                        />
                      ) : (
                        <div className="flex items-start gap-3 p-3.5 rounded-lg bg-background border border-border/60 group">
                          <div
                            className={`mt-0.5 shrink-0 ${record.attended ? "text-success" : "text-destructive"}`}
                          >
                            {record.attended ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <XCircle className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm">
                                {record.subjectName}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${record.attended ? "attended-badge" : "absent-badge"}`}
                              >
                                {record.attended ? "Present" : "Absent"}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5 truncate">
                              {record.topicCovered}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-xs text-muted-foreground">
                              {formatDisplayDate(record.date)}
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditingRecordId(recordIdStr)}
                              className="p-1.5 rounded-md text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                              aria-label="Edit attendance record"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
