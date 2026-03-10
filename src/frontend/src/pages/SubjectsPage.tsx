import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Note, Subject } from "../backend-shim.d.ts";
import {
  useAddNote,
  useAddSubject,
  useDeleteNote,
  useDeleteSubject,
  useNotesBySubject,
  useSubjects,
  useUpdateNoteAI,
  useUserProfile,
} from "../hooks/useQueries";

// ─── Resource links generator ─────────────────────────────────────────────

interface ResourceLink {
  label: string;
  url: string;
  type: "pdf" | "book" | "video" | "website";
}

function generateResourceLinks(
  subjectName: string,
  _noteTitle: string,
  userLevel: string,
): ResourceLink[] {
  const subjectLower = subjectName.toLowerCase();
  const isCollege = userLevel === "College";

  if (!isCollege) {
    // School (CBSE) resources
    return [
      {
        label: "NCERT Textbooks (Official)",
        url: "https://ncert.nic.in/textbook.php",
        type: "pdf",
      },
      {
        label: "CBSE Sample Question Papers",
        url: "https://cbse.gov.in/newsite/SQP.html",
        type: "pdf",
      },
      {
        label: "NCERT Solutions & Notes",
        url: "https://ncert.nic.in/",
        type: "website",
      },
      {
        label: "CBSE Study Material",
        url: "https://cbseacademic.nic.in/",
        type: "pdf",
      },
      {
        label: "Free PDF Books Archive",
        url: `https://archive.org/search?query=${encodeURIComponent(`${subjectName} CBSE`)}`,
        type: "book",
      },
      {
        label: `Khan Academy — ${subjectName}`,
        url: `https://www.khanacademy.org/search?page_search_query=${encodeURIComponent(subjectName)}`,
        type: "video",
      },
    ];
  }

  // College resources
  const resources: ResourceLink[] = [
    {
      label: "Free Textbooks — Archive.org",
      url: `https://archive.org/search?query=${encodeURIComponent(subjectName)}`,
      type: "book",
    },
    {
      label: "NPTEL Video Lectures",
      url: `https://nptel.ac.in/courses#searchSection?q=${encodeURIComponent(subjectName)}`,
      type: "video",
    },
    {
      label: "Open Library — Free Books",
      url: `https://openlibrary.org/search?q=${encodeURIComponent(subjectName)}`,
      type: "book",
    },
    {
      label: "MIT OpenCourseWare",
      url: `https://ocw.mit.edu/search/?q=${encodeURIComponent(subjectName)}`,
      type: "pdf",
    },
    {
      label: "SlideShare — Study Notes",
      url: `https://www.slideshare.net/search/slideshow?searchfrom=header&q=${encodeURIComponent(subjectName)}`,
      type: "pdf",
    },
  ];

  // Add subject-specific engineering links
  if (
    subjectLower.includes("math") ||
    subjectLower.includes("physics") ||
    subjectLower.includes("chemistry")
  ) {
    resources.push({
      label: "GATE Previous Papers",
      url: "https://gate.iitk.ac.in/",
      type: "pdf",
    });
  }

  if (
    subjectLower.includes("computer") ||
    subjectLower.includes("programming") ||
    subjectLower.includes("data")
  ) {
    resources.push({
      label: "GeeksForGeeks — CS Notes",
      url: `https://www.geeksforgeeks.org/search/?q=${encodeURIComponent(subjectName)}`,
      type: "website",
    });
  }

  return resources;
}

// ─── Important Questions generator (College) ──────────────────────────────

interface ImportantQuestion {
  question: string;
  difficulty: "Hard" | "Medium" | "Easy";
  source: string;
}

function generateImportantQuestions(
  title: string,
  content: string,
): ImportantQuestion[] {
  const topic = title.split(" ").slice(0, 4).join(" ");
  const firstLine = content.split(/[.!?]/)[0]?.trim() || topic;

  return [
    {
      question: `Define ${topic} and state its fundamental principles.`,
      difficulty: "Easy",
      source: "University Exam",
    },
    {
      question: `List and explain the key characteristics of ${topic}.`,
      difficulty: "Easy",
      source: "Internal Assessment",
    },
    {
      question: `Explain the working mechanism of ${topic} with a suitable example.`,
      difficulty: "Medium",
      source: "University Exam",
    },
    {
      question: `Differentiate between the major types/categories discussed in ${topic}. Give examples.`,
      difficulty: "Medium",
      source: "Competitive Exam",
    },
    {
      question: `Apply the concept of "${firstLine}" to solve a real-world problem in your domain.`,
      difficulty: "Medium",
      source: "GATE / CAT",
    },
    {
      question: `Critically analyze the limitations and advantages of ${topic} compared to alternative approaches.`,
      difficulty: "Hard",
      source: "GATE",
    },
    {
      question: `Design a system/solution that leverages ${topic}. Justify your design choices.`,
      difficulty: "Hard",
      source: "Competitive Exam",
    },
    {
      question: `Evaluate how ${topic} has evolved over time and predict its future implications.`,
      difficulty: "Hard",
      source: "Research / Viva",
    },
  ];
}

// ─── Difficulty badge ──────────────────────────────────────────────────────

function DifficultyBadge({
  difficulty,
}: { difficulty: "Hard" | "Medium" | "Easy" }) {
  if (difficulty === "Hard")
    return (
      <Badge className="text-[10px] px-1.5 py-0.5 bg-red-500/15 text-red-400 border border-red-400/25 hover:bg-red-500/20">
        Hard
      </Badge>
    );
  if (difficulty === "Medium")
    return (
      <Badge className="text-[10px] px-1.5 py-0.5 bg-amber-400/15 text-amber-400 border border-amber-400/25 hover:bg-amber-400/20">
        Medium
      </Badge>
    );
  return (
    <Badge className="text-[10px] px-1.5 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-400/25 hover:bg-emerald-500/20">
      Easy
    </Badge>
  );
}

// ─── Resource icon ─────────────────────────────────────────────────────────

function ResourceIcon({ type }: { type: ResourceLink["type"] }) {
  if (type === "pdf") return <FileText className="w-3.5 h-3.5 shrink-0" />;
  if (type === "book") return <BookOpen className="w-3.5 h-3.5 shrink-0" />;
  if (type === "video")
    return (
      <span className="text-xs shrink-0" aria-hidden>
        ▶
      </span>
    );
  return <ExternalLink className="w-3.5 h-3.5 shrink-0" />;
}

// ─── Generate mock AI content ──────────────────────────────────────────────

function generateAIContent(title: string, content: string) {
  const words = content.split(/\s+/).filter(Boolean);
  const firstFewWords = words.slice(0, 6).join(" ");
  const firstSentence =
    content.split(/[.!?]/)[0]?.trim() || content.slice(0, 80);

  const topics = [
    firstFewWords || "Main Concept",
    title.split(" ").slice(0, 2).join(" ") || "Key Topic",
    "Important Definitions",
    "Formulas & Applications",
  ]
    .filter(Boolean)
    .slice(0, 4);

  return {
    aiSummary: `Summary of "${title}": ${content.slice(0, 120)}${content.length > 120 ? "..." : ""} This topic covers fundamental concepts essential for examination preparation.`,
    aiKeyTopics: topics.join(", "),
    aiShortNotes: `• Remember: ${firstSentence}\n• Key formula: Refer to textbook chapter reference\n• Quick tip: Practice daily and solve previous year questions\n• Important: Focus on conceptual understanding, not just memorization`,
    aiPyqs: `Q1. Define the main concept of ${title.split(" ").slice(0, 3).join(" ")} and explain with an example.\nQ2. What are the key properties/characteristics discussed in this topic?\nQ3. Solve a numerical/descriptive problem based on this concept.\nQ4. Compare and contrast different aspects covered in this chapter.\n\n(Source: CBSE/Board Previous Year Questions)`,
  };
}

// ─── NoteCard ──────────────────────────────────────────────────────────────

interface NoteCardProps {
  note: Note;
  onDelete: (id: bigint) => void;
  userLevel: string;
}

function NoteCard({ note, onDelete, userLevel }: NoteCardProps) {
  const [expanded, setExpanded] = useState(false);
  const deleteNote = useDeleteNote();
  const isCollege = userLevel === "College";

  const hasAI = note.aiSummary || note.aiKeyTopics;

  const handleDelete = async () => {
    try {
      await deleteNote.mutateAsync(note.id);
      onDelete(note.id);
      toast.success("Note deleted");
    } catch {
      toast.error("Failed to delete note");
    }
  };

  const resourceLinks = generateResourceLinks(
    note.subjectName,
    note.title,
    userLevel,
  );
  const impQuestions = isCollege
    ? generateImportantQuestions(note.title, note.content)
    : [];

  const easyQs = impQuestions.filter((q) => q.difficulty === "Easy");
  const mediumQs = impQuestions.filter((q) => q.difficulty === "Medium");
  const hardQs = impQuestions.filter((q) => q.difficulty === "Hard");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="bg-background border border-border/60 rounded-xl overflow-hidden hover:border-primary/20 transition-colors"
    >
      {/* Note header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display font-semibold text-sm">
                {note.title}
              </h3>
              {hasAI && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-violet-400/10 text-violet-400 border border-violet-400/20">
                  <Sparkles className="w-2.5 h-2.5" />
                  AI Enhanced
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {note.content}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteNote.isPending}
              className="p-1.5 text-muted-foreground/40 hover:text-destructive transition-colors"
            >
              {deleteNote.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </button>
            {hasAI && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="p-1.5 text-muted-foreground/60 hover:text-foreground transition-colors"
              >
                {expanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI enrichment section */}
      <AnimatePresence>
        {expanded && hasAI && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border/60"
          >
            <div className="p-4 pt-3">
              <div className="flex items-center gap-1.5 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-xs font-semibold text-violet-400">
                  AI Enrichment
                </span>
              </div>

              <Tabs defaultValue="summary">
                {/* Scrollable tab list on mobile */}
                <div className="overflow-x-auto pb-1 mb-3">
                  <TabsList className="bg-card/60 border border-border/40 h-8 w-max min-w-full flex">
                    <TabsTrigger value="summary" className="text-xs h-6 px-3">
                      Summary
                    </TabsTrigger>
                    <TabsTrigger value="topics" className="text-xs h-6 px-3">
                      Key Topics
                    </TabsTrigger>
                    <TabsTrigger
                      value="shortnotes"
                      className="text-xs h-6 px-3"
                    >
                      Short Notes
                    </TabsTrigger>
                    {isCollege ? (
                      <TabsTrigger
                        value="impquestions"
                        className="text-xs h-6 px-3"
                      >
                        Imp. Questions
                      </TabsTrigger>
                    ) : (
                      <TabsTrigger value="pyqs" className="text-xs h-6 px-3">
                        PYQs
                      </TabsTrigger>
                    )}
                    <TabsTrigger value="resources" className="text-xs h-6 px-3">
                      Resources
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="summary" className="mt-0">
                  <p className="text-sm text-foreground/80 leading-relaxed bg-card/40 rounded-lg p-3">
                    {note.aiSummary}
                  </p>
                </TabsContent>

                <TabsContent value="topics" className="mt-0">
                  <div className="flex flex-wrap gap-2 bg-card/40 rounded-lg p-3">
                    {note.aiKeyTopics.split(",").map((topic) => (
                      <span
                        key={topic.trim()}
                        className="px-2.5 py-1 rounded-full text-xs bg-primary/15 text-primary border border-primary/20"
                      >
                        {topic.trim()}
                      </span>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="shortnotes" className="mt-0">
                  <div className="bg-card/40 rounded-lg p-3 space-y-1.5">
                    {note.aiShortNotes.split("\n").map((line) => (
                      <p
                        key={`sn-${line.slice(0, 20)}`}
                        className="text-sm text-foreground/80"
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </TabsContent>

                {/* School: PYQs tab */}
                {!isCollege && (
                  <TabsContent value="pyqs" className="mt-0">
                    <div className="bg-card/40 rounded-lg p-3 space-y-1.5">
                      {note.aiPyqs.split("\n").map((line) => (
                        <p
                          key={`pyq-${line.slice(0, 20)}`}
                          className={`text-sm ${line.startsWith("Q") ? "font-medium text-foreground" : "text-muted-foreground"}`}
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </TabsContent>
                )}

                {/* College: Important Questions tab */}
                {isCollege && (
                  <TabsContent value="impquestions" className="mt-0">
                    <div className="space-y-2">
                      {/* Easy */}
                      {easyQs.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-emerald-400 mb-1.5">
                            Easy
                          </div>
                          <div className="space-y-1.5">
                            {easyQs.map((q) => (
                              <div
                                key={q.question.slice(0, 40)}
                                className="flex items-start gap-2 bg-emerald-500/5 border border-emerald-400/15 rounded-lg p-2.5"
                              >
                                <DifficultyBadge difficulty={q.difficulty} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-foreground/85">
                                    {q.question}
                                  </p>
                                  <span className="text-[10px] text-muted-foreground mt-1 block">
                                    Source: {q.source}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Medium */}
                      {mediumQs.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-amber-400 mb-1.5">
                            Medium
                          </div>
                          <div className="space-y-1.5">
                            {mediumQs.map((q) => (
                              <div
                                key={q.question.slice(0, 40)}
                                className="flex items-start gap-2 bg-amber-400/5 border border-amber-400/15 rounded-lg p-2.5"
                              >
                                <DifficultyBadge difficulty={q.difficulty} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-foreground/85">
                                    {q.question}
                                  </p>
                                  <span className="text-[10px] text-muted-foreground mt-1 block">
                                    Source: {q.source}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Hard */}
                      {hardQs.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-red-400 mb-1.5">
                            Hard
                          </div>
                          <div className="space-y-1.5">
                            {hardQs.map((q) => (
                              <div
                                key={q.question.slice(0, 40)}
                                className="flex items-start gap-2 bg-red-500/5 border border-red-400/15 rounded-lg p-2.5"
                              >
                                <DifficultyBadge difficulty={q.difficulty} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-foreground/85">
                                    {q.question}
                                  </p>
                                  <span className="text-[10px] text-muted-foreground mt-1 block">
                                    Source: {q.source}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                )}

                {/* Resources tab for ALL users */}
                <TabsContent value="resources" className="mt-0">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground mb-2">
                      {isCollege
                        ? "Free textbooks, video lectures, and university papers:"
                        : "NCERT books, CBSE papers, and study materials:"}
                    </p>
                    {resourceLinks.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-card/50 border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all group text-sm"
                      >
                        <span className="text-primary/70 group-hover:text-primary transition-colors">
                          <ResourceIcon type={link.type} />
                        </span>
                        <span className="flex-1 font-medium text-foreground/85 group-hover:text-foreground transition-colors">
                          {link.label}
                        </span>
                        <ExternalLink className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary/60 transition-colors shrink-0" />
                      </a>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── SubjectNotes ──────────────────────────────────────────────────────────

interface SubjectNotesProps {
  subject: Subject;
  userLevel: string;
}

function SubjectNotes({ subject, userLevel }: SubjectNotesProps) {
  const {
    data: notes = [],
    isLoading,
    refetch,
  } = useNotesBySubject(subject.id);
  const addNote = useAddNote();
  const updateNoteAI = useUpdateNoteAI();
  const [showForm, setShowForm] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [aiProcessing, setAiProcessing] = useState(false);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) {
      toast.error("Please enter a note title");
      return;
    }
    if (!noteContent.trim()) {
      toast.error("Please enter note content");
      return;
    }

    try {
      const noteId = await addNote.mutateAsync({
        subjectId: subject.id,
        subjectName: subject.name,
        title: noteTitle.trim(),
        content: noteContent.trim(),
      });

      setAiProcessing(true);
      toast.info("🤖 AI is processing your notes...", { duration: 2000 });

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const aiContent = generateAIContent(noteTitle.trim(), noteContent.trim());
      await updateNoteAI.mutateAsync({ noteId, ...aiContent });

      setAiProcessing(false);
      toast.success("Note added with AI enrichment! ✨");
      setNoteTitle("");
      setNoteContent("");
      setShowForm(false);
      refetch();
    } catch {
      setAiProcessing(false);
      toast.error("Failed to add note");
    }
  };

  return (
    <div className="space-y-4">
      {/* Add note form */}
      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="w-full flex items-center gap-3 p-3.5 rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add note for {subject.name}...</span>
        </button>
      ) : (
        <motion.form
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleAddNote}
          className="bg-card border border-border/60 rounded-xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold">
              New Note — {subject.name}
            </h3>
            <button type="button" onClick={() => setShowForm(false)}>
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note-title">Note Title</Label>
            <Input
              id="note-title"
              placeholder="e.g. Trigonometry — Chapter 8 Summary"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="bg-background border-border"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note-content">Content</Label>
            <Textarea
              id="note-content"
              placeholder="Write your notes here... AI will extract key topics, generate PYQs/important questions, and find relevant PDFs & resources automatically."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="bg-background border-border min-h-[120px] resize-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-violet-400/5 border border-violet-400/15 rounded-lg px-3 py-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0" />
            AI will generate summary, key topics, short notes,{" "}
            {userLevel === "College"
              ? "important questions by difficulty"
              : "CBSE PYQs"}{" "}
            and downloadable resource links
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={addNote.isPending || aiProcessing}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {aiProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AI Processing...
                </>
              ) : addNote.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add & Enrich
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
        </motion.form>
      )}

      {/* Notes list */}
      {isLoading ? (
        <div className="space-y-3">
          {["note-sk-1", "note-sk-2"].map((id) => (
            <Skeleton key={id} className="h-24 rounded-xl skeleton-shimmer" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border/60 rounded-xl">
          <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <div className="font-display font-semibold">No notes yet</div>
          <div className="text-sm text-muted-foreground mt-1">
            Add your first note for {subject.name}
          </div>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-3">
            {notes.map((note) => (
              <NoteCard
                key={note.id.toString()}
                note={note}
                onDelete={() => refetch()}
                userLevel={userLevel}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}

// ─── SubjectsPage ──────────────────────────────────────────────────────────

interface SubjectsPageProps {
  userLevel?: string;
}

export default function SubjectsPage({
  userLevel: userLevelProp,
}: SubjectsPageProps) {
  const { data: subjects = [], isLoading } = useSubjects();
  const { data: userProfile } = useUserProfile();
  const addSubjectMutation = useAddSubject();
  const deleteSubjectMutation = useDeleteSubject();
  const [selectedSubjectId, setSelectedSubjectId] = useState<bigint | null>(
    null,
  );
  const [newSubjectName, setNewSubjectName] = useState("");
  const [showAddSubject, setShowAddSubject] = useState(false);

  // Use prop if provided, else fall back to fetched profile
  const resolvedUserLevel = userLevelProp ?? userProfile?.level ?? "School";

  const selectedSubject =
    subjects.find((s) => s.id === selectedSubjectId) || subjects[0] || null;

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) {
      toast.error("Please enter a subject name");
      return;
    }
    try {
      await addSubjectMutation.mutateAsync(newSubjectName.trim());
      toast.success(`${newSubjectName} added!`);
      setNewSubjectName("");
      setShowAddSubject(false);
    } catch {
      toast.error("Failed to add subject");
    }
  };

  const handleDeleteSubject = async (id: bigint, name: string) => {
    try {
      await deleteSubjectMutation.mutateAsync(id);
      toast.success(`${name} deleted`);
      if (selectedSubjectId === id) setSelectedSubjectId(null);
    } catch {
      toast.error("Failed to delete subject");
    }
  };

  const activeSubject = selectedSubjectId
    ? subjects.find((s) => s.id === selectedSubjectId) || selectedSubject
    : selectedSubject;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-violet-400" />
          Subjects & Notes
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your subjects and AI-enriched notes
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-5">
        {/* Subjects panel */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border/60 rounded-xl p-4 h-fit lg:sticky lg:top-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold">Subjects</h2>
            <button
              type="button"
              onClick={() => setShowAddSubject(!showAddSubject)}
              className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add subject form */}
          <AnimatePresence>
            {showAddSubject && (
              <motion.form
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                onSubmit={handleAddSubject}
                className="mb-3 overflow-hidden"
              >
                <div className="flex gap-2 pt-1 pb-2">
                  <Input
                    placeholder="Subject name..."
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    className="bg-background border-border text-sm h-8"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={addSubjectMutation.isPending}
                    className="bg-primary text-primary-foreground h-8 px-3"
                  >
                    {addSubjectMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Subject list */}
          {isLoading ? (
            <div className="space-y-2">
              {["sub-a", "sub-b", "sub-c", "sub-d"].map((id) => (
                <Skeleton
                  key={id}
                  className="h-10 rounded-lg skeleton-shimmer"
                />
              ))}
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No subjects yet.
              <br />
              Add your first subject above.
            </div>
          ) : (
            <div className="space-y-1">
              {subjects.map((subject) => (
                <button
                  key={subject.id.toString()}
                  type="button"
                  className={`group w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all text-left ${
                    activeSubject?.id === subject.id
                      ? "bg-primary/15 border border-primary/25 text-primary"
                      : "hover:bg-accent/60 text-foreground/80 hover:text-foreground"
                  }`}
                  onClick={() => setSelectedSubjectId(subject.id)}
                >
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-sm font-medium flex-1 truncate">
                    {subject.name}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSubject(subject.id, subject.name);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground/40 hover:text-destructive transition-all"
                    aria-label={`Delete ${subject.name}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Notes panel */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {!activeSubject ? (
            <div className="flex flex-col items-center justify-center py-20 bg-card border border-border/60 rounded-xl">
              <BookOpen className="w-12 h-12 text-muted-foreground/20 mb-4" />
              <div className="font-display font-semibold text-lg">
                Select a subject
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Click a subject on the left to view its notes
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-violet-400/10 border border-violet-400/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl">
                    {activeSubject.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {activeSubject.level} level
                  </p>
                </div>
              </div>
              <SubjectNotes
                subject={activeSubject}
                userLevel={resolvedUserLevel}
              />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
