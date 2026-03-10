import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  Loader2,
  Plus,
  School,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, type Variants, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAddSubject, useSetUserProfile } from "../hooks/useQueries";

interface OnboardingPageProps {
  onComplete: () => void;
}

// School classes
const SCHOOL_CLASSES = [
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
];

// Subjects by class
const SUBJECTS_BY_CLASS: Record<string, string[]> = {
  "Class 8": ["Mathematics", "Science", "Social Science", "English", "Hindi"],
  "Class 9": ["Mathematics", "Science", "Social Science", "English", "Hindi"],
  "Class 10": ["Mathematics", "Science", "Social Science", "English", "Hindi"],
  "Class 11": [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "Economics",
    "Computer Science",
    "Physical Education",
  ],
  "Class 12": [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "Economics",
    "Computer Science",
    "Accountancy",
    "Business Studies",
  ],
};

// College programs
const COLLEGE_PROGRAMS = [
  { label: "BTech / BE", value: "BTech" },
  { label: "BBA", value: "BBA" },
  { label: "BA", value: "BA" },
  { label: "BSc", value: "BSc" },
  { label: "BCom", value: "BCom" },
  { label: "BCA", value: "BCA" },
  { label: "MBA", value: "MBA" },
  { label: "MCA", value: "MCA" },
  { label: "MBBS", value: "MBBS" },
  { label: "BDS", value: "BDS" },
  { label: "BAMS / Ayurveda", value: "BAMS" },
  { label: "Nursing (B.Sc)", value: "Nursing" },
  { label: "Law (LLB)", value: "LLB" },
  { label: "Architecture (B.Arch)", value: "Architecture" },
  { label: "Diploma", value: "Diploma" },
  { label: "Other", value: "Other" },
];

const COLLEGE_SUBJECTS: Record<string, string[]> = {
  BTech: [
    "Engineering Mathematics",
    "Physics",
    "Chemistry",
    "Programming",
    "Data Structures",
    "Electronics",
  ],
  BBA: [
    "Business Management",
    "Economics",
    "Accounting",
    "Marketing",
    "Statistics",
    "English",
  ],
  BA: [
    "English Literature",
    "History",
    "Political Science",
    "Sociology",
    "Philosophy",
  ],
  BSc: ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science"],
  BCom: [
    "Accountancy",
    "Business Studies",
    "Economics",
    "Mathematics",
    "Statistics",
  ],
  BCA: [
    "Programming",
    "Data Structures",
    "Database Management",
    "Web Development",
    "Mathematics",
  ],
  MBA: ["Management", "Finance", "Marketing", "Operations", "Human Resources"],
  MCA: [
    "Advanced Programming",
    "Software Engineering",
    "Database Systems",
    "Networks",
  ],
  MBBS: ["Anatomy", "Physiology", "Biochemistry", "Pathology", "Pharmacology"],
  BDS: ["Dental Anatomy", "Oral Pathology", "Pharmacology", "Periodontics"],
  BAMS: [
    "Sanskrit",
    "Ayurvedic Principles",
    "Anatomy",
    "Dravyaguna",
    "Rasashastra",
  ],
  Nursing: [
    "Anatomy",
    "Physiology",
    "Pharmacology",
    "Medical-Surgical Nursing",
  ],
  LLB: [
    "Constitutional Law",
    "Criminal Law",
    "Civil Law",
    "Contract Law",
    "Legal Methods",
  ],
  Architecture: [
    "Architectural Design",
    "Building Construction",
    "Structural Systems",
    "Environmental Design",
  ],
  Diploma: [
    "Mathematics",
    "Science",
    "Engineering Drawing",
    "Workshop Technology",
  ],
  Other: ["Mathematics", "Science", "English"],
};

type Level = "School" | "College" | null;

const pageVariants: Variants = {
  enter: { opacity: 0, x: 30 },
  center: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
  exit: { opacity: 0, x: -30, transition: { duration: 0.2 } },
};

export default function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [step, setStep] = useState(1);
  const [level, setLevel] = useState<Level>(null);
  const [classLevel, setClassLevel] = useState<string>("");
  const [course, setCourse] = useState("");
  const [customCourse, setCustomCourse] = useState("");
  const [name, setName] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectInput, setSubjectInput] = useState("");

  const setUserProfile = useSetUserProfile();
  const addSubjectMutation = useAddSubject();

  const isOther = course === "Other";
  const finalCourse = isOther ? customCourse : course;

  const suggestedSubjects =
    level === "School"
      ? SUBJECTS_BY_CLASS[classLevel] || []
      : COLLEGE_SUBJECTS[course] || COLLEGE_SUBJECTS.Other;

  const addSubject = (subName: string) => {
    const trimmed = subName.trim();
    if (!trimmed) return;
    if (subjects.includes(trimmed)) {
      toast.error("Subject already added");
      return;
    }
    setSubjects((prev) => [...prev, trimmed]);
    setSubjectInput("");
  };

  const removeSubject = (sub: string) => {
    setSubjects((prev) => prev.filter((s) => s !== sub));
  };

  const handleStep1 = (selectedLevel: Level) => {
    setLevel(selectedLevel);
    setStep(2);
  };

  const handleStep2School = (selectedClass: string) => {
    setClassLevel(selectedClass);
    const defaults = (SUBJECTS_BY_CLASS[selectedClass] || []).slice(0, 4);
    setSubjects(defaults);
    setStep(3);
  };

  const handleStep2College = (prog: string) => {
    setCourse(prog);
    const defaults = (COLLEGE_SUBJECTS[prog] || COLLEGE_SUBJECTS.Other).slice(
      0,
      4,
    );
    setSubjects(defaults);
    if (prog !== "Other") setStep(3);
  };

  const handleOtherContinue = () => {
    if (!customCourse.trim()) {
      toast.error("Please enter your course name");
      return;
    }
    setSubjects(COLLEGE_SUBJECTS.Other.slice(0, 3));
    setStep(3);
  };

  const handleFinish = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (subjects.length === 0) {
      toast.error("Please add at least one subject");
      return;
    }
    try {
      const classVal =
        level === "School" ? classLevel : finalCourse.trim() || null;
      await setUserProfile.mutateAsync({
        name: name.trim(),
        level: level!,
        classLevel: classVal,
        subjects,
      });
      await Promise.all(
        subjects.map((sub) => addSubjectMutation.mutateAsync(sub)),
      );
      toast.success("Welcome to EDUCERA! 🎉");
      onComplete();
    } catch {
      toast.error("Failed to create profile. Please try again.");
    }
  };

  const isFinishing = setUserProfile.isPending || addSubjectMutation.isPending;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 dot-texture opacity-25 pointer-events-none" />
      <div className="hero-blob-1 fixed top-1/4 left-1/3 opacity-50" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2.5 mb-8"
        >
          <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center glow-indigo">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <span className="font-display font-extrabold text-xl tracking-tight gradient-text-blue">
              EDUCERA
            </span>
            <div className="text-xs text-muted-foreground leading-none">
              Your Full Time Batchie
            </div>
          </div>
        </motion.div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <motion.div
              key={s}
              animate={{
                width: s <= step ? 32 : 12,
                background:
                  s <= step ? "oklch(0.62 0.22 272)" : "oklch(0.25 0.032 258)",
              }}
              transition={{ duration: 0.3 }}
              className="h-1.5 rounded-full"
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Choose level */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="glass rounded-2xl border border-border/60 p-6 sm:p-8 shadow-elevated"
            >
              <h1 className="font-display text-2xl font-bold mb-1">
                Welcome! 👋
              </h1>
              <p className="text-muted-foreground mb-8">
                What's your current study level?
              </p>

              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStep1("School")}
                  className="group flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-border/60 bg-background/60 hover:border-amber-300/50 hover:bg-amber-300/5 transition-all duration-200"
                >
                  <div className="w-14 h-14 rounded-2xl bg-amber-300/10 border border-amber-300/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <School className="w-7 h-7 text-amber-300" />
                  </div>
                  <div className="text-center">
                    <div className="font-display font-semibold">School</div>
                    <div className="text-xs text-muted-foreground">
                      CBSE Classes 8–12
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-amber-300 transition-colors" />
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStep1("College")}
                  className="group flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-border/60 bg-background/60 hover:border-violet-400/50 hover:bg-violet-400/5 transition-all duration-200"
                >
                  <div className="w-14 h-14 rounded-2xl bg-violet-400/10 border border-violet-400/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-7 h-7 text-violet-400" />
                  </div>
                  <div className="text-center">
                    <div className="font-display font-semibold">College</div>
                    <div className="text-xs text-muted-foreground">
                      UG / PG / Professional
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-violet-400 transition-colors" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 2: School — choose class */}
          {step === 2 && level === "School" && (
            <motion.div
              key="step2-school"
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="glass rounded-2xl border border-border/60 p-6 sm:p-8 shadow-elevated"
            >
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1 transition-colors"
              >
                ← Back
              </button>
              <h1 className="font-display text-2xl font-bold mb-1">
                Your Class
              </h1>
              <p className="text-muted-foreground mb-6">
                Which CBSE class are you in?
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SCHOOL_CLASSES.map((cls) => (
                  <motion.button
                    key={cls}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleStep2School(cls)}
                    className="group flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-border/60 bg-background/60 hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="font-display font-semibold text-sm">
                      {cls}
                    </div>
                    <div className="text-xs text-muted-foreground">CBSE</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: College — choose program */}
          {step === 2 && level === "College" && (
            <motion.div
              key="step2-college"
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="glass rounded-2xl border border-border/60 p-6 sm:p-8 shadow-elevated"
            >
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1 transition-colors"
              >
                ← Back
              </button>
              <h1 className="font-display text-2xl font-bold mb-1">
                Your Program
              </h1>
              <p className="text-muted-foreground mb-5">
                Select your degree or diploma program
              </p>

              <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {COLLEGE_PROGRAMS.map((prog) => (
                  <motion.button
                    key={prog.value}
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleStep2College(prog.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium text-left transition-all ${
                      course === prog.value
                        ? "border-primary/60 bg-primary/10 text-primary"
                        : "border-border/60 bg-background/50 hover:border-primary/30 hover:bg-primary/5"
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                    {prog.label}
                  </motion.button>
                ))}
              </div>

              {isOther && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 space-y-3"
                >
                  <div className="space-y-2">
                    <Label>Course / Program Name</Label>
                    <Input
                      placeholder="e.g. B.Sc. Animation, B.Pharm..."
                      value={customCourse}
                      onChange={(e) => setCustomCourse(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleOtherContinue()
                      }
                      className="bg-background/60 border-border"
                      autoFocus
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleOtherContinue}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Continue <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 3: Name & Subjects */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="glass rounded-2xl border border-border/60 p-6 sm:p-8 shadow-elevated"
            >
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1 transition-colors"
              >
                ← Back
              </button>
              <h1 className="font-display text-2xl font-bold mb-1">
                Almost there!
              </h1>
              <p className="text-muted-foreground mb-6">
                Tell us your name and confirm your subjects.
              </p>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="student-name">Your Name</Label>
                  <Input
                    id="student-name"
                    placeholder="e.g. Arjun Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background/60 border-border"
                    autoFocus
                  />
                </div>

                <div className="space-y-3">
                  <Label>Your Subjects</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a subject..."
                      value={subjectInput}
                      onChange={(e) => setSubjectInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSubject(subjectInput);
                        }
                      }}
                      className="bg-background/60 border-border flex-1"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => addSubject(subjectInput)}
                      className="border-border hover:border-primary/50"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {subjects.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {subjects.map((sub) => (
                        <motion.span
                          key={sub}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/25 text-sm text-primary"
                        >
                          {sub}
                          <button
                            type="button"
                            onClick={() => removeSubject(sub)}
                            className="hover:text-primary/60 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Suggested subjects:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestedSubjects
                        .filter((s) => !subjects.includes(s))
                        .map((sub) => (
                          <motion.button
                            key={sub}
                            type="button"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => addSubject(sub)}
                            className="px-2.5 py-1 text-xs rounded-full border border-border/60 bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                          >
                            + {sub}
                          </motion.button>
                        ))}
                    </div>
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Button
                    type="button"
                    onClick={handleFinish}
                    disabled={isFinishing}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold glow-indigo"
                  >
                    {isFinishing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      "Launch EDUCERA 🚀"
                    )}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
