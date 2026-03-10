import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  CheckSquare,
  ChevronRight,
  Code2,
  Database,
  Globe,
  GraduationCap,
  Lock,
  Mail,
  Server,
  Shield,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { AnimatePresence, type Variants, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

// ─── Section IDs ──────────────────────────────────────────────
const SECTIONS = [
  { id: "hero", label: "Intro" },
  { id: "problem", label: "Problem" },
  { id: "solution", label: "Solution" },
  { id: "audience", label: "Audience" },
  { id: "attendance", label: "Attendance" },
  { id: "tasks", label: "Tasks" },
  { id: "notes", label: "Notes & AI" },
  { id: "techstack", label: "Tech Stack" },
  { id: "comparison", label: "ICP vs Traditional" },
  { id: "future", label: "Future Scope" },
  { id: "team", label: "Team" },
];

// ─── Animation variants ───────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const fadeRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

// ─── Section wrapper ──────────────────────────────────────────
function Section({
  id,
  children,
  className = "",
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`min-h-screen flex flex-col justify-center relative ${className}`}
    >
      {children}
    </section>
  );
}

// ─── Section label pill ───────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={fadeUp} className="mb-5">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
        {children}
      </div>
    </motion.div>
  );
}

// ─── Section heading ──────────────────────────────────────────
function SectionHeading({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.h2
      variants={fadeUp}
      className={`font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight mb-4 ${className}`}
    >
      {children}
    </motion.h2>
  );
}

// ─── 1. Hero Section ─────────────────────────────────────────
function HeroSection() {
  return (
    <Section id="hero" className="overflow-hidden">
      <div className="absolute inset-0 dot-texture opacity-20 pointer-events-none" />
      <div className="hero-blob-1 absolute top-[-80px] left-[8%] opacity-70" />
      <div className="hero-blob-2 absolute bottom-[5%] right-[5%] opacity-60" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Logo */}
          <motion.div variants={scaleIn} className="mb-8">
            <div className="w-20 h-20 rounded-3xl bg-primary/15 border border-primary/30 flex items-center justify-center glow-indigo mx-auto mb-6">
              <GraduationCap className="w-10 h-10 text-primary" />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
              <Sparkles className="w-3 h-3" />
              <span>
                Student Productivity Platform · Built on ICP Blockchain
              </span>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={fadeUp}
            className="font-display font-extrabold text-6xl sm:text-7xl lg:text-8xl tracking-tight leading-[1] mb-3"
          >
            <span className="gradient-text">EDUCERA</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="font-display text-2xl sm:text-3xl font-bold text-foreground/70 mb-6"
          >
            Your Full Time Batchie
          </motion.p>

          <motion.p
            variants={fadeUp}
            className="text-muted-foreground text-lg sm:text-xl leading-relaxed max-w-2xl mb-10"
          >
            A smart web app for Indian students — track attendance, manage
            tasks, and enrich notes with AI. Built on the Internet Computer
            blockchain.
          </motion.p>

          {/* Tags */}
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap gap-3 justify-center"
          >
            {[
              "React + TypeScript",
              "Motoko Backend",
              "ICP Blockchain",
              "AI-Enriched Notes",
              "Classes 8–12 & College",
            ].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full glass border border-primary/20 text-xs font-medium text-foreground/80"
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-muted-foreground/50"
      >
        <span className="text-xs">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 1.5,
            ease: "easeInOut",
          }}
        >
          <ChevronRight className="w-4 h-4 rotate-90" />
        </motion.div>
      </motion.div>
    </Section>
  );
}

// ─── 2. Problem Section ───────────────────────────────────────
const problems = [
  {
    icon: "📒",
    title: "Scattered Attendance",
    description:
      "Students manually note attendance in registers or personal notebooks — error-prone and easy to forget.",
  },
  {
    icon: "📋",
    title: "No Task System",
    description:
      "Study tasks live in WhatsApp reminders or sticky notes, with no priority, due dates, or streak tracking.",
  },
  {
    icon: "🗂️",
    title: "Disorganized Notes",
    description:
      "Notes are spread across physical notebooks, Google Docs, and PDFs — no AI enrichment or PYQ linkage.",
  },
];

function ProblemSection() {
  return (
    <Section id="problem" className="bg-card/30">
      <div className="absolute inset-0 grid-texture opacity-10 pointer-events-none" />
      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 py-20">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <SectionLabel>
            <Target className="w-3 h-3" />
            The Problem
          </SectionLabel>
          <SectionHeading>
            Students juggle too many tools,{" "}
            <span className="gradient-text">none of them connected.</span>
          </SectionHeading>
          <motion.p
            variants={fadeUp}
            className="text-muted-foreground text-lg mb-12 max-w-2xl"
          >
            Indian school and college students lack a unified platform built
            around their daily academic routine.
          </motion.p>

          <motion.div variants={stagger} className="grid sm:grid-cols-3 gap-6">
            {problems.map((p) => (
              <motion.div
                key={p.title}
                variants={scaleIn}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="card-shine glass rounded-2xl border border-destructive/20 p-6 hover:border-destructive/40 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{p.icon}</div>
                <h3 className="font-display font-bold text-lg mb-2">
                  {p.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {p.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </Section>
  );
}

// ─── 3. Solution Section ──────────────────────────────────────
const solutions = [
  { icon: Calendar, label: "Attendance Tracking", color: "text-amber-300" },
  { icon: CheckSquare, label: "Task Management", color: "text-violet-400" },
  { icon: BookOpen, label: "Subject Notes", color: "text-teal-400" },
  { icon: Brain, label: "AI Enrichment", color: "text-rose-400" },
];

function SolutionSection() {
  return (
    <Section id="solution">
      <div className="hero-blob-1 absolute top-1/4 right-[-100px] opacity-40" />
      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 py-20">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <SectionLabel>
            <Zap className="w-3 h-3" />
            The Solution
          </SectionLabel>
          <SectionHeading>
            EDUCERA brings it{" "}
            <span className="gradient-text">all together.</span>
          </SectionHeading>
          <motion.p
            variants={fadeUp}
            className="text-muted-foreground text-lg mb-12 max-w-2xl"
          >
            One platform, four core modules — designed specifically for Indian
            CBSE and college students.
          </motion.p>

          <motion.div
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {solutions.map((s, i) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -6, scale: 1.03 }}
                transition={{ duration: 0.2 }}
                className="card-shine glass rounded-2xl gradient-border p-6 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 glow-indigo">
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <div className="font-display font-semibold text-sm">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Big stat */}
          <motion.div
            variants={scaleIn}
            className="mt-12 glass rounded-2xl gradient-border p-8 text-center relative overflow-hidden"
          >
            <div className="hero-blob-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" />
            <div className="relative z-10">
              <div className="font-display font-extrabold text-5xl sm:text-6xl gradient-text mb-2">
                1 Platform
              </div>
              <div className="text-muted-foreground text-lg">
                For all study tracking needs — attendance, tasks, notes, and
                AI-powered resources
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Section>
  );
}

// ─── 4. Audience Section ─────────────────────────────────────
const schoolClasses = [
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
];
const collegePrograms = [
  "BTech",
  "BBA",
  "BA",
  "BSc",
  "BCom",
  "BCA",
  "MBA",
  "MBBS",
  "BDS",
  "BAMS",
  "Nursing",
  "LLB",
  "Architecture",
  "Diploma",
];

function AudienceSection() {
  return (
    <Section id="audience" className="bg-card/20">
      <div className="absolute inset-0 dot-texture opacity-15 pointer-events-none" />
      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 py-20">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <SectionLabel>
            <Users className="w-3 h-3" />
            Who Is It For?
          </SectionLabel>
          <SectionHeading>
            Built for{" "}
            <span className="gradient-text">every Indian student.</span>
          </SectionHeading>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            {/* School */}
            <motion.div
              variants={fadeLeft}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="card-shine glass rounded-2xl border border-amber-300/20 p-6"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-amber-300/10 border border-amber-300/20 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <div className="font-display font-bold text-lg">
                    School Students
                  </div>
                  <div className="text-xs text-muted-foreground">
                    CBSE / State Board
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {schoolClasses.map((c) => (
                  <span
                    key={c}
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: "oklch(0.78 0.19 62 / 0.12)",
                      border: "1px solid oklch(0.78 0.19 62 / 0.3)",
                      color: "oklch(0.88 0.15 62)",
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>
              <div className="mt-5 p-3 rounded-xl bg-amber-300/5 border border-amber-300/10 text-sm text-muted-foreground">
                ✅ PYQs, NCERT books, CBSE sample papers
              </div>
            </motion.div>

            {/* College */}
            <motion.div
              variants={fadeRight}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="card-shine glass rounded-2xl border border-primary/20 p-6"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-display font-bold text-lg">
                    College Students
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Any Degree Program
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {collegePrograms.map((p) => (
                  <span
                    key={p}
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: "oklch(0.62 0.22 272 / 0.12)",
                      border: "1px solid oklch(0.62 0.22 272 / 0.3)",
                      color: "oklch(0.78 0.18 272)",
                    }}
                  >
                    {p}
                  </span>
                ))}
              </div>
              <div className="mt-5 p-3 rounded-xl bg-primary/5 border border-primary/10 text-sm text-muted-foreground">
                ✅ Imp. Questions (Easy / Medium / Hard), NPTEL lectures
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

// ─── 5. Attendance Section ────────────────────────────────────
function AttendanceSection() {
  return (
    <Section id="attendance">
      <div className="hero-blob-2 absolute bottom-[10%] left-[5%] opacity-40" />
      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <SectionLabel>
              <Calendar className="w-3 h-3" />
              Feature 1
            </SectionLabel>
            <SectionHeading>
              Attendance <span className="gradient-text">Tracking</span>
            </SectionHeading>
            <motion.div variants={stagger} className="space-y-3 mt-4">
              {[
                "Log classes attended per subject daily",
                "Record topics covered each session",
                "Calendar + list view of full history",
                "Edit any entry — no duplicate logs",
                "75% attendance goal tracker built-in",
              ].map((point) => (
                <motion.div
                  key={point}
                  variants={fadeLeft}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground text-sm">{point}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Mock UI */}
          <motion.div
            variants={fadeRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="glass rounded-2xl gradient-border p-5 glow-indigo"
          >
            <div className="font-display font-bold text-sm mb-4 text-muted-foreground uppercase tracking-wider">
              Today's Attendance
            </div>
            <div className="space-y-3">
              {[
                {
                  subject: "Mathematics",
                  topic: "Integration by Parts",
                  present: true,
                  pct: 88,
                },
                {
                  subject: "Physics",
                  topic: "Wave Optics",
                  present: true,
                  pct: 82,
                },
                { subject: "Chemistry", topic: "—", present: false, pct: 60 },
                {
                  subject: "English",
                  topic: "Poetry Analysis",
                  present: true,
                  pct: 91,
                },
              ].map((row) => (
                <div
                  key={row.subject}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card/60 border border-border/40"
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${row.present ? "bg-success" : "bg-destructive"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{row.subject}</div>
                    {row.present && (
                      <div className="text-xs text-muted-foreground truncate">
                        {row.topic}
                      </div>
                    )}
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background:
                        row.pct >= 75
                          ? "oklch(0.70 0.16 148 / 0.18)"
                          : "oklch(0.63 0.24 22 / 0.18)",
                      color:
                        row.pct >= 75
                          ? "oklch(0.80 0.13 148)"
                          : "oklch(0.80 0.18 22)",
                      border: `1px solid ${row.pct >= 75 ? "oklch(0.70 0.16 148 / 0.35)" : "oklch(0.63 0.24 22 / 0.35)"}`,
                    }}
                  >
                    {row.pct}%
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

// ─── 6. Tasks Section ────────────────────────────────────────
function TasksSection() {
  return (
    <Section id="tasks" className="bg-card/20">
      <div className="hero-blob-1 absolute top-[10%] right-[-80px] opacity-35" />
      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Mock UI */}
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="glass rounded-2xl gradient-border p-5 order-2 md:order-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="font-display font-bold text-sm text-muted-foreground uppercase tracking-wider">
                Today's Tasks
              </div>
              <div className="text-xs text-primary font-semibold">
                🔥 5 day streak
              </div>
            </div>
            <div className="space-y-3">
              {[
                {
                  task: "Solve 10 Integration problems",
                  priority: "high",
                  done: true,
                },
                {
                  task: "Read Chapter 4 – Wave Optics",
                  priority: "medium",
                  done: true,
                },
                { task: "Sleep for 8 hours", priority: "low", done: false },
                {
                  task: "Revise Organic Chemistry",
                  priority: "high",
                  done: false,
                },
              ].map((t) => (
                <div
                  key={t.task}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card/60 border border-border/40"
                >
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      t.done
                        ? "bg-success/20 border-success"
                        : "border-border/60"
                    }`}
                  >
                    {t.done && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm ${
                        t.done
                          ? "line-through text-muted-foreground"
                          : "font-medium"
                      }`}
                    >
                      {t.task}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 priority-${t.priority}`}
                  >
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="order-1 md:order-2"
          >
            <SectionLabel>
              <CheckSquare className="w-3 h-3" />
              Feature 2
            </SectionLabel>
            <SectionHeading>
              Task <span className="gradient-text">Management</span>
            </SectionHeading>
            <motion.div variants={stagger} className="space-y-3 mt-4">
              {[
                "Self-assign any task — no subject required",
                "Set priority: High / Medium / Low",
                "One-tap mark complete on mobile",
                "Daily streak tracking for consistency",
                "Filter by priority, status, or due date",
              ].map((point) => (
                <motion.div
                  key={point}
                  variants={fadeRight}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground text-sm">{point}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

// ─── 7. Notes & AI Section ───────────────────────────────────
function NotesSection() {
  return (
    <Section id="notes">
      <div className="hero-blob-2 absolute top-[20%] left-[-60px] opacity-40" />
      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <SectionLabel>
              <Brain className="w-3 h-3" />
              Feature 3
            </SectionLabel>
            <SectionHeading>
              Notes &amp; <span className="gradient-text">AI Enrichment</span>
            </SectionHeading>
            <motion.p
              variants={fadeUp}
              className="text-muted-foreground text-sm mb-4"
            >
              Upload your notes and let AI do the heavy lifting.
            </motion.p>
            <motion.div variants={stagger} className="space-y-3">
              {[
                "Upload text, PDF, or image notes",
                "AI extracts key topics automatically",
                "Downloadable NCERT PDFs & CBSE books",
                "School: PYQs from past 10 years",
                "College: Imp. Questions (Easy/Medium/Hard)",
                "NPTEL video lecture links for college",
              ].map((point) => (
                <motion.div
                  key={point}
                  variants={fadeLeft}
                  className="flex items-start gap-3"
                >
                  <Sparkles className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground text-sm">{point}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Mock Notes Card */}
          <motion.div
            variants={fadeRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-3"
          >
            <div className="glass rounded-2xl gradient-border p-5">
              <div className="font-display font-bold text-sm mb-3">
                Mathematics — Trigonometry
              </div>
              <div className="flex gap-2 mb-4">
                {["Summary", "PYQs", "Resources"].map((tab, i) => (
                  <div
                    key={tab}
                    className={`px-3 py-1 rounded-full text-xs font-semibold cursor-default ${
                      i === 0
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "text-muted-foreground"
                    }`}
                  >
                    {tab}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Key topics extracted:{" "}
                <strong className="text-foreground">
                  sin/cos/tan identities
                </strong>
                , <strong className="text-foreground">inverse trig</strong>,{" "}
                <strong className="text-foreground">compound angles</strong>
              </p>
              <div className="space-y-2">
                {[
                  { name: "NCERT Class 12 Maths.pdf", type: "NCERT" },
                  { name: "CBSE PYQ 2023 Maths.pdf", type: "PYQ" },
                  { name: "CBSE Sample Paper 2024.pdf", type: "Sample" },
                ].map((file) => (
                  <div
                    key={file.name}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-card/60 border border-border/40 hover:border-primary/30 transition-colors cursor-pointer group"
                  >
                    <div className="w-6 h-6 rounded bg-primary/15 flex items-center justify-center">
                      <BookOpen className="w-3 h-3 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">
                        {file.name}
                      </div>
                    </div>
                    <Badge className="text-[10px] h-4 px-1.5">
                      {file.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

// ─── 8. Tech Stack Section ───────────────────────────────────
const techItems = [
  {
    icon: Code2,
    title: "React 19 + TypeScript",
    desc: "Modern frontend with strong typing",
    color: "text-teal-400",
    bg: "bg-teal-400/10",
    border: "border-teal-400/20",
  },
  {
    icon: Zap,
    title: "Tailwind CSS",
    desc: "Utility-first responsive styling",
    color: "text-sky-400",
    bg: "bg-sky-400/10",
    border: "border-sky-400/20",
  },
  {
    icon: Sparkles,
    title: "Framer Motion",
    desc: "Smooth animations & transitions",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/20",
  },
  {
    icon: Server,
    title: "Motoko Backend",
    desc: "ICP native smart contract language",
    color: "text-amber-300",
    bg: "bg-amber-300/10",
    border: "border-amber-300/20",
  },
  {
    icon: Globe,
    title: "Internet Computer",
    desc: "Decentralized hosting & storage",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    icon: Lock,
    title: "Internet Identity",
    desc: "Secure, passwordless auth on ICP",
    color: "text-rose-400",
    bg: "bg-rose-400/10",
    border: "border-rose-400/20",
  },
];

function TechStackSection() {
  return (
    <Section id="techstack" className="bg-card/25">
      <div className="absolute inset-0 grid-texture opacity-8 pointer-events-none" />
      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 py-20">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <SectionLabel>
            <Code2 className="w-3 h-3" />
            Tech Stack
          </SectionLabel>
          <SectionHeading>
            Built with{" "}
            <span className="gradient-text">modern technologies.</span>
          </SectionHeading>

          <motion.div
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8"
          >
            {techItems.map((tech) => (
              <motion.div
                key={tech.title}
                variants={scaleIn}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className={`card-shine glass rounded-xl border ${tech.border} p-5`}
              >
                <div
                  className={`w-10 h-10 rounded-lg ${tech.bg} border ${tech.border} flex items-center justify-center mb-3`}
                >
                  <tech.icon className={`w-5 h-5 ${tech.color}`} />
                </div>
                <div className="font-display font-bold text-sm mb-1">
                  {tech.title}
                </div>
                <div className="text-xs text-muted-foreground">{tech.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </Section>
  );
}

// ─── 9. Comparison Section ───────────────────────────────────
const comparisonRows = [
  {
    aspect: "Database",
    traditional: "MySQL / PostgreSQL",
    icp: "Motoko Canister",
  },
  {
    aspect: "Hosting",
    traditional: "AWS / GCP Servers",
    icp: "Decentralized Network",
  },
  {
    aspect: "Security",
    traditional: "Can be hacked / DDOS",
    icp: "Tamper-Resistant",
  },
  {
    aspect: "Cost",
    traditional: "Pay for servers monthly",
    icp: "Blockchain Compute",
  },
  { aspect: "Downtime", traditional: "Server maintenance", icp: "Always-On" },
  {
    aspect: "Data Ownership",
    traditional: "Company-controlled",
    icp: "User-Sovereign",
  },
];

function ComparisonSection() {
  return (
    <Section id="comparison">
      <div className="hero-blob-1 absolute bottom-[5%] right-[5%] opacity-30" />
      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 py-20">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <SectionLabel>
            <Database className="w-3 h-3" />
            ICP vs Traditional
          </SectionLabel>
          <SectionHeading>
            Why <span className="gradient-text">Internet Computer?</span>
          </SectionHeading>

          {/* Table */}
          <motion.div
            variants={scaleIn}
            className="mt-8 glass rounded-2xl overflow-hidden gradient-border"
          >
            {/* Header */}
            <div className="grid grid-cols-3 text-xs font-bold uppercase tracking-wider">
              <div className="p-4 text-muted-foreground border-b border-border/40">
                Feature
              </div>
              <div
                className="p-4 border-b border-border/40 text-center"
                style={{
                  background: "oklch(0.63 0.24 22 / 0.08)",
                  color: "oklch(0.80 0.18 22)",
                }}
              >
                Traditional App
              </div>
              <div
                className="p-4 border-b border-border/40 text-center"
                style={{
                  background: "oklch(0.62 0.22 272 / 0.10)",
                  color: "oklch(0.78 0.18 272)",
                }}
              >
                EDUCERA on ICP ✓
              </div>
            </div>
            {comparisonRows.map((row, i) => (
              <motion.div
                key={row.aspect}
                variants={fadeUp}
                className={`grid grid-cols-3 text-sm ${
                  i < comparisonRows.length - 1
                    ? "border-b border-border/30"
                    : ""
                }`}
              >
                <div className="p-4 font-semibold text-muted-foreground">
                  {row.aspect}
                </div>
                <div
                  className="p-4 text-center text-sm"
                  style={{
                    background: "oklch(0.63 0.24 22 / 0.04)",
                    color: "oklch(0.70 0.12 22)",
                  }}
                >
                  {row.traditional}
                </div>
                <div
                  className="p-4 text-center text-sm font-semibold"
                  style={{
                    background: "oklch(0.62 0.22 272 / 0.06)",
                    color: "oklch(0.80 0.15 272)",
                  }}
                >
                  {row.icp}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </Section>
  );
}

// ─── 10. Future Scope Section ─────────────────────────────────
const futureItems = [
  {
    icon: "👨‍🏫",
    title: "Teacher & Parent Dashboards",
    desc: "Multi-role support for classroom management",
    phase: "Phase 2",
  },
  {
    icon: "🤖",
    title: "Real AI API Integration",
    desc: "Live Groq / OpenAI for personalized summaries",
    phase: "Phase 2",
  },
  {
    icon: "🔔",
    title: "Push Reminders",
    desc: "Smart notifications for tasks and attendance",
    phase: "Phase 3",
  },
  {
    icon: "👥",
    title: "Collaborative Notes",
    desc: "Share notes and resources with classmates",
    phase: "Phase 3",
  },
  {
    icon: "🌐",
    title: "Multi-Language Support",
    desc: "Hindi, Tamil, Telugu and more regional languages",
    phase: "Phase 4",
  },
  {
    icon: "📊",
    title: "Analytics Dashboard",
    desc: "Subject-wise performance heatmaps and insights",
    phase: "Phase 4",
  },
];

function FutureScopeSection() {
  return (
    <Section id="future" className="bg-card/20">
      <div className="absolute inset-0 dot-texture opacity-15 pointer-events-none" />
      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 py-20">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <SectionLabel>
            <Target className="w-3 h-3" />
            Future Scope
          </SectionLabel>
          <SectionHeading>
            The <span className="gradient-text">roadmap ahead.</span>
          </SectionHeading>

          <motion.div
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8"
          >
            {futureItems.map((item) => (
              <motion.div
                key={item.title}
                variants={scaleIn}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="card-shine glass rounded-xl border border-border/40 p-5 hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{item.icon}</span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: "oklch(0.62 0.22 272 / 0.12)",
                      border: "1px solid oklch(0.62 0.22 272 / 0.25)",
                      color: "oklch(0.75 0.16 272)",
                    }}
                  >
                    {item.phase}
                  </span>
                </div>
                <div className="font-display font-bold text-sm mb-1">
                  {item.title}
                </div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </Section>
  );
}

// ─── 11. Team Section ─────────────────────────────────────────
const teamMembers = [
  {
    name: "Suraj Kumar",
    email: "surajkumarg1209@gmail.com",
    initials: "SK",
    role: "Full-Stack Developer",
    gradFrom: "oklch(0.62 0.22 272)",
    gradTo: "oklch(0.72 0.20 320)",
  },
  {
    name: "Ayush Singh",
    email: "ayush342006@gmail.com",
    initials: "AS",
    role: "Frontend & AI Integration",
    gradFrom: "oklch(0.78 0.19 62)",
    gradTo: "oklch(0.68 0.24 272)",
  },
];

function TeamSection() {
  return (
    <Section id="team">
      <div className="hero-blob-1 absolute top-0 left-1/2 -translate-x-1/2 opacity-40" />
      <div className="hero-blob-2 absolute bottom-0 left-[10%] opacity-35" />
      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 py-20 text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <SectionLabel>
            <Users className="w-3 h-3" />
            The Team
          </SectionLabel>
          <SectionHeading>Built with ❤️ by</SectionHeading>
          <motion.p
            variants={fadeUp}
            className="text-muted-foreground text-lg mb-12 max-w-xl mx-auto"
          >
            A passionate team of student developers building tools they wish
            they had.
          </motion.p>

          <motion.div
            variants={stagger}
            className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12"
          >
            {teamMembers.map((member) => (
              <motion.div
                key={member.name}
                variants={scaleIn}
                whileHover={{ y: -8, scale: 1.03 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="card-shine glass rounded-2xl gradient-border p-7 flex flex-col items-center gap-4"
              >
                {/* Avatar */}
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center font-display font-extrabold text-2xl text-white shadow-card"
                  style={{
                    background: `linear-gradient(135deg, ${member.gradFrom}, ${member.gradTo})`,
                  }}
                >
                  {member.initials}
                </div>

                <div>
                  <div className="font-display font-bold text-xl mb-0.5">
                    {member.name}
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">
                    {member.role}
                  </div>
                  <a
                    href={`mailto:${member.email}`}
                    className="inline-flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors group"
                  >
                    <Mail className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    <span className="underline-offset-2 hover:underline">
                      {member.email}
                    </span>
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Footer note */}
          <motion.div variants={fadeUp}>
            <div className="glass rounded-2xl border border-border/40 px-8 py-5 inline-block">
              <div className="text-sm text-muted-foreground">
                Built on{" "}
                <span className="font-semibold text-foreground">
                  Internet Computer
                </span>
                {" · "}Powered by{" "}
                <a
                  href="https://caffeine.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  Caffeine AI
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Section>
  );
}

// ─── Navigation Dots (desktop) ───────────────────────────────
function NavDots({
  activeSection,
  onNavigate,
}: {
  activeSection: string;
  onNavigate: (id: string) => void;
}) {
  return (
    <div className="fixed right-5 top-1/2 -translate-y-1/2 z-50 hidden xl:flex flex-col gap-2">
      {SECTIONS.map((section) => (
        <button
          key={section.id}
          type="button"
          onClick={() => onNavigate(section.id)}
          title={section.label}
          className="group relative flex items-center justify-end gap-2"
          aria-label={`Go to ${section.label} section`}
        >
          {/* Label tooltip on hover */}
          <AnimatePresence>
            <motion.span
              initial={{ opacity: 0, x: 8 }}
              whileHover={{ opacity: 1, x: 0 }}
              className="absolute right-6 text-xs font-semibold text-foreground/70 whitespace-nowrap bg-card/90 backdrop-blur-sm border border-border/40 px-2 py-1 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              {section.label}
            </motion.span>
          </AnimatePresence>

          <div
            className={`rounded-full transition-all duration-300 ${
              activeSection === section.id
                ? "w-3 h-3 bg-primary glow-indigo"
                : "w-2 h-2 bg-muted-foreground/40 hover:bg-muted-foreground/70"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function PresentationPage() {
  const [activeSection, setActiveSection] = useState("hero");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Intersection observer for active section
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    for (const section of SECTIONS) {
      const el = document.getElementById(section.id);
      if (!el) continue;
      sectionRefs.current[section.id] = el;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(section.id);
          }
        },
        { threshold: 0.4, rootMargin: "-10% 0px -10% 0px" },
      );
      obs.observe(el);
      observers.push(obs);
    }

    return () => {
      for (const obs of observers) {
        obs.disconnect();
      }
    };
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 border-b border-border/40 backdrop-blur-sm bg-background/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2.5"
          >
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center glow-indigo">
              <GraduationCap className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-display font-bold tracking-tight gradient-text-blue">
              EDUCERA
            </span>
            <span className="text-muted-foreground/50 text-xs hidden sm:inline">
              · Presentation Mode
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                window.location.href = "/";
              }}
              className="text-muted-foreground hover:text-foreground group"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
              Back to Home
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Nav dots */}
      <NavDots activeSection={activeSection} onNavigate={scrollToSection} />

      {/* Sections */}
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <AudienceSection />
      <AttendanceSection />
      <TasksSection />
      <NotesSection />
      <TechStackSection />
      <ComparisonSection />
      <FutureScopeSection />
      <TeamSection />

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-muted-foreground/60 text-xs">
        © {new Date().getFullYear()} EDUCERA · Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="text-primary/70 hover:text-primary transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
