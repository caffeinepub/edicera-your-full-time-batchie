import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckSquare,
  Sparkles,
  Star,
  Target,
  Zap,
} from "lucide-react";
import { type Variants, motion } from "motion/react";

const features = [
  {
    icon: Calendar,
    title: "Daily Attendance",
    description:
      "Log classes attended, track topics, and visualize attendance per subject with a 75% goal tracker.",
    color: "text-amber-300",
    bg: "bg-amber-300/10",
    border: "border-amber-300/20",
  },
  {
    icon: CheckSquare,
    title: "Task Management",
    description:
      "Set daily and weekly tasks, assign priorities, track streaks — because consistency beats intensity.",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/20",
  },
  {
    icon: BookOpen,
    title: "Subject Notes",
    description:
      "Upload notes for every subject. AI enriches them with summaries, key topics, and CBSE PYQs.",
    color: "text-teal-400",
    bg: "bg-teal-400/10",
    border: "border-teal-400/20",
  },
  {
    icon: Sparkles,
    title: "AI Enrichment",
    description:
      "Auto-generated summaries, important formulas, and previous-year CBSE questions — instantly.",
    color: "text-rose-400",
    bg: "bg-rose-400/10",
    border: "border-rose-400/20",
  },
];

const stats = [
  { label: "Active Students", value: "10K+", icon: "👩‍🎓" },
  { label: "Notes Enriched", value: "50K+", icon: "📝" },
  { label: "Tasks Completed", value: "200K+", icon: "✅" },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

interface LandingPageProps {
  onSignIn: () => void;
}

export default function LandingPage({ onSignIn }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      <div className="fixed inset-0 dot-texture opacity-30 pointer-events-none" />
      <div className="hero-blob-1 fixed top-[-100px] left-[10%] opacity-60" />
      <div className="hero-blob-2 fixed bottom-[10%] right-[5%] opacity-50" />

      {/* Header */}
      <header className="relative z-10 border-b border-border/40 backdrop-blur-sm bg-background/60 sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center glow-indigo">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight gradient-text-blue">
              EDUCERA
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Button
              onClick={onSignIn}
              size="sm"
              className="bg-primary/90 hover:bg-primary text-primary-foreground font-semibold hover:scale-[1.02] transition-all duration-200"
            >
              Sign In
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-8 md:pt-24 md:pb-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
                <Star className="w-3 h-3" />
                <span>Designed for Indian Students · CBSE &amp; College</span>
              </div>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-3"
            >
              <span className="gradient-text">EDUCERA</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="font-display text-2xl sm:text-3xl font-semibold text-foreground/80 mb-5"
            >
              Your Full Time Batchie
            </motion.p>

            <motion.p
              variants={itemVariants}
              className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-md"
            >
              Track attendance, manage tasks, and enrich notes with AI — all in
              one place. Built for CBSE classes 8–12 and college students across
              India.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Button
                onClick={onSignIn}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 group glow-indigo hover:scale-[1.02] transition-all duration-200"
              >
                Start Learning Free
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <div className="flex items-center gap-2 text-muted-foreground text-sm self-center">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                <span>Free · No setup needed</span>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-6 mt-10 pt-8 border-t border-border/40"
            >
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-display font-bold">
                    {stat.icon} {stat.value}
                  </div>
                  <div className="text-muted-foreground text-xs mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="relative hidden md:block"
          >
            <div className="relative rounded-2xl overflow-hidden border border-border/40 shadow-elevated gradient-border">
              <img
                src="/assets/generated/edicera-hero.dim_900x600.jpg"
                alt="EDUCERA study platform"
                className="w-full h-auto object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 glass rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-xl font-display font-bold gradient-text">
                      🔥 7
                    </div>
                    <div className="text-xs text-muted-foreground">Streak</div>
                  </div>
                  <div className="flex-1 h-px bg-border/60" />
                  <div className="text-center">
                    <div className="text-xl font-display font-bold">85%</div>
                    <div className="text-xs text-muted-foreground">
                      Attendance
                    </div>
                  </div>
                  <div className="flex-1 h-px bg-border/60" />
                  <div className="text-center">
                    <div className="text-xl font-display font-bold">12</div>
                    <div className="text-xs text-muted-foreground">Tasks</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Everything your studies need
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From attendance logs to AI-enriched notes — EDUCERA keeps you on
            track, every day.
          </p>
        </motion.div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className={`card-shine glass rounded-xl border ${feature.border} p-5 hover:border-primary/30 transition-all duration-300`}
            >
              <div
                className={`w-10 h-10 rounded-lg ${feature.bg} border ${feature.border} flex items-center justify-center mb-4`}
              >
                <feature.icon className={`w-5 h-5 ${feature.color}`} />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl gradient-border p-8 sm:p-14 text-center relative overflow-hidden"
        >
          <div className="hero-blob-1 absolute top-[-200px] left-1/2 -translate-x-1/2 opacity-40" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/25 text-primary text-xs font-semibold mb-5">
              <Target className="w-3 h-3" />
              Your Full Time Batchie
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold mb-4">
              Ready to study <span className="gradient-text">smarter?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Join students building real habits with EDUCERA — free, instant,
              and built for Indian curricula.
            </p>
            <Button
              onClick={onSignIn}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-10 glow-indigo hover:scale-[1.03] transition-all duration-200"
            >
              Get Started — It&apos;s Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/40 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-muted-foreground text-sm">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-display font-bold gradient-text-blue">
              EDUCERA
            </span>
            <span className="text-muted-foreground/60">·</span>
            <span>Your Full Time Batchie</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/presentation"
              className="text-muted-foreground/60 hover:text-primary transition-colors text-xs"
            >
              Presentation Mode
            </a>
            <span className="text-muted-foreground/40">·</span>
            <span>
              © {new Date().getFullYear()} · Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                caffeine.ai
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
