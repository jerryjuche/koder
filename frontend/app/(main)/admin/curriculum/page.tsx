"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const MarkdownPreview = dynamic(() => import("@/components/admin/curriculum/MarkdownPreview"), { ssr: false });
import {
  fetchAllCourses, createCourse, updateCourse, deleteCourse,
  fetchModules, createModule, updateModule, deleteModule,
  fetchLessons, createLesson, updateLesson, deleteLesson,
  fetchProjects, createProject, updateProject, deleteProject,
  createSection, updateSection, deleteSection, reorderSections,
  toggleCourseVisibility,
  toggleModuleVisibility,
  toggleLessonVisibility,
  toggleProjectVisibility,
} from "@/lib/api";
import {
  Course, Module, Lesson, LessonSection, Project, NewLessonSection,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProblemBank from "@/components/admin/curriculum/ProblemBank";
import { toast } from "@/lib/toast";
import { clearCache } from "@/lib/cache";
import {
  Plus, Edit3, Trash2, BookOpen, Layers, FileText, Beaker,
  ChevronRight, GripVertical, ArrowUp, ArrowDown,
  ListOrdered, Lightbulb,
  AlertTriangle, Sparkles, ScrollText, BrainCircuit,
  Target, FileCode, Star, BookText, Puzzle, FlaskConical,
} from "lucide-react";
import { AdminCourseCard, AdminModuleCard, AdminLessonCard, AdminProjectCard } from "@/components/admin/curriculum/AdminCards";

type Panel = "courses" | "modules" | "lessons" | "projects" | "sections";

const SECTION_TYPES = [
  "overview", "explanation", "examples", "best_practices",
  "common_mistakes", "summary", "quiz", "exercises",
  "mini_project", "assessment", "ai_review",
];

const SECTION_TYPE_ICONS: Record<string, React.ReactNode> = {
  overview: <BookText className="h-3.5 w-3.5" />,
  explanation: <FileText className="h-3.5 w-3.5" />,
  examples: <Puzzle className="h-3.5 w-3.5" />,
  best_practices: <Star className="h-3.5 w-3.5" />,
  common_mistakes: <AlertTriangle className="h-3.5 w-3.5" />,
  summary: <ScrollText className="h-3.5 w-3.5" />,
  quiz: <BrainCircuit className="h-3.5 w-3.5" />,
  exercises: <FlaskConical className="h-3.5 w-3.5" />,
  mini_project: <Target className="h-3.5 w-3.5" />,
  assessment: <FileCode className="h-3.5 w-3.5" />,
  ai_review: <Sparkles className="h-3.5 w-3.5" />,
};

const SECTION_TYPE_COLORS: Record<string, string> = {
  overview: "border-l-blue-400 bg-blue-50/30",
  explanation: "border-l-sky-400 bg-sky-50/30",
  examples: "border-l-violet-400 bg-violet-50/30",
  best_practices: "border-l-emerald-400 bg-emerald-50/30",
  common_mistakes: "border-l-rose-400 bg-rose-50/30",
  summary: "border-l-amber-400 bg-amber-50/30",
  quiz: "border-l-orange-400 bg-orange-50/30",
  exercises: "border-l-teal-400 bg-teal-50/30",
  mini_project: "border-l-purple-400 bg-purple-50/30",
  assessment: "border-l-indigo-400 bg-indigo-50/30",
  ai_review: "border-l-fuchsia-400 bg-fuchsia-50/30",
};

export default function CurriculumAdminPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sections, setSections] = useState<LessonSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingModules, setLoadingModules] = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "course" | "module" | "lesson" | "project";
    id: string;
    name: string;
  } | null>(null);

  // Form states
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [quizQuestionForm, setQuizQuestionForm] = useState({
    question: "",
    optionsRaw: "",
    correctIndex: 0,
    points: 1,
    explanation: "",
  });

  const loadCourses = useCallback(async () => {
    const res = await fetchAllCourses();
    if (res.success && res.data) setCourses(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCourses();
  }, [loadCourses]);

  const loadModules = useCallback(async (courseId: string) => {
    setLoadingModules(true);
    setModules([]);
    clearCache(`/admin/courses/${courseId}/modules`);
    const res = await fetchModules(courseId);
    if (res.success && res.data) setModules(res.data);
    else toast.error(res.error?.message || "Failed to load modules");
    setLoadingModules(false);
  }, []);

  const loadLessons = useCallback(async (moduleId: string) => {
    setLoadingLessons(true);
    setLessons([]);
    clearCache(`/admin/modules/${moduleId}/lessons`);
    const res = await fetchLessons(moduleId);
    if (res.success && res.data) setLessons(res.data);
    else toast.error(res.error?.message || "Failed to load lessons");
    setLoadingLessons(false);
  }, []);

  const loadProjects = useCallback(async (lessonId: string) => {
    const res = await fetchProjects(lessonId);
    if (res.success && res.data) setProjects(res.data);
    else toast.error(res.error?.message || "Failed to load projects");
  }, []);

  const loadSections = useCallback(async (lessonId: string) => {
    try {
      const { fetchLessonSections } = await import("@/lib/api");
      const res = await fetchLessonSections(lessonId);
      if (res.success && res.data) {
        setSections(Array.isArray(res.data) ? res.data : []);
      }
    } catch {
      setSections([]);
    }
  }, []);

  // ── Course handlers ──

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setSelectedModule(null);
    setSelectedLesson(null);
    setExpandedCourse(expandedCourse === course.id ? null : course.id);
    if (expandedCourse !== course.id) loadModules(course.id);
  };

  const handleCreateCourse = async () => {
    const res = await createCourse(formData as any);
    if (res.success) {
      toast.success("Course created");
      setShowCourseForm(false);
      setFormData({});
      loadCourses();
    } else {
      toast.error(res.error?.message || "Failed to create course");
    }
  };

  const handleUpdateCourse = async () => {
    if (!editingItem) return;
    const res = await updateCourse(editingItem.id, formData as any);
    if (res.success) {
      toast.success("Course updated");
      setEditingItem(null);
      setFormData({});
      loadCourses();
    } else {
      toast.error(res.error?.message || "Failed to update course");
    }
  };

  const handleToggleCourseVisibility = async (course: Course) => {
    const res = await toggleCourseVisibility(course.id);
    if (res.success) {
      toast.success(course.visible ? "Course hidden" : "Course published");
      setCourses((prev) => prev.map((c) => c.id === course.id ? (res.data || c) : c));
      if (selectedCourse?.id === course.id) setSelectedCourse(res.data || course);
    } else {
      toast.error(res.error?.message || "Failed to toggle visibility");
    }
  };

  const handleDeleteCourse = async (id: string) => {
    setDeleteConfirm({ type: "course", id, name: courses.find((c) => c.id === id)?.title || "this course" });
  };
  const executeDeleteCourse = async (id: string) => {
    const res = await deleteCourse(id);
    if (res.success) {
      toast.success("Course deleted");
      if (selectedCourse?.id === id) { setSelectedCourse(null); setModules([]); }
      loadCourses();
    } else {
      toast.error(res.error?.message || "Failed to delete course");
    }
  };

  const handleToggleModuleVisibility = async (mod: Module) => {
    const res = await toggleModuleVisibility(mod.id);
    if (res.success) {
      toast.success(mod.visible ? "Module hidden" : "Module published");
      setModules((prev) => prev.map((m) => m.id === mod.id ? (res.data || m) : m));
    } else {
      toast.error(res.error?.message || "Failed to toggle visibility");
    }
  };

  const handleToggleLessonVisibility = async (lesson: Lesson) => {
    const res = await toggleLessonVisibility(lesson.id);
    if (res.success) {
      toast.success(lesson.visible ? "Lesson hidden" : "Lesson published");
      setLessons((prev) => prev.map((l) => l.id === lesson.id ? (res.data || l) : l));
    } else {
      toast.error(res.error?.message || "Failed to toggle visibility");
    }
  };

  const handleToggleProjectVisibility = async (proj: Project) => {
    const res = await toggleProjectVisibility(proj.id);
    if (res.success) {
      toast.success(proj.visible ? "Project hidden" : "Project published");
      setProjects((prev) => prev.map((p) => p.id === proj.id ? (res.data || p) : p));
    } else {
      toast.error(res.error?.message || "Failed to toggle visibility");
    }
  };

  // ── Module handlers ──

  const handleModuleSelect = (mod: Module) => {
    setSelectedModule(mod);
    setSelectedLesson(null);
    loadLessons(mod.id);
  };

  const handleCreateModule = async () => {
    if (!selectedCourse) return;
    const res = await createModule(selectedCourse.id, { ...formData, course_id: selectedCourse.id } as any);
    if (res.success) {
      toast.success("Module created");
      setShowModuleForm(false);
      setFormData({});
      loadModules(selectedCourse.id);
    } else {
      toast.error(res.error?.message || "Failed to create module");
    }
  };

  const handleUpdateModule = async () => {
    if (!editingItem) return;
    const res = await updateModule(editingItem.id, formData as any);
    if (res.success) {
      toast.success("Module updated");
      setEditingItem(null);
      setFormData({});
      if (selectedCourse) loadModules(selectedCourse.id);
    } else {
      toast.error(res.error?.message || "Failed to update module");
    }
  };

  const handleDeleteModule = async (id: string) => {
    setDeleteConfirm({ type: "module", id, name: modules.find((m) => m.id === id)?.title || "this module" });
  };
  const executeDeleteModule = async (id: string) => {
    const res = await deleteModule(id);
    if (res.success) {
      toast.success("Module deleted");
      if (selectedModule?.id === id) { setSelectedModule(null); setLessons([]); }
      if (selectedCourse) loadModules(selectedCourse.id);
    } else {
      toast.error(res.error?.message || "Failed to delete module");
    }
  };

  // ── Lesson handlers ──

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setSections([]);
    loadProjects(lesson.id);
    loadSections(lesson.id);
  };

  const handleCreateLesson = async () => {
    if (!selectedModule) return;
    const lessonFields: Record<string, any> = {
      slug: formData.slug || "",
      title: formData.title || "",
      description: formData.description || "",
      raw_readme: formData.raw_readme || "",
      difficulty: formData.difficulty ?? 1,
      estimated_minutes: formData.estimated_minutes ?? 10,
      xp_reward: formData.xp_reward ?? 50,
      order_number: formData.order_number ?? 0,
      visible: formData.visible !== false,
      problem_references: formData.problem_references || [],
      module_id: selectedModule.id,
    };
    const payload = { lesson: lessonFields };
    const res = await createLesson(selectedModule.id, payload);
    if (res.success) {
      toast.success("Lesson created");
      setShowLessonForm(false);
      setFormData({});
      loadLessons(selectedModule.id);
    } else {
      toast.error(res.error?.message || "Failed to create lesson");
    }
  };

  const handleUpdateLesson = async () => {
    if (!editingItem) return;
    const lessonFields: Record<string, any> = {
      slug: formData.slug || editingItem.slug,
      title: formData.title || editingItem.title,
      description: formData.description ?? editingItem.description,
      raw_readme: formData.raw_readme ?? editingItem.raw_readme,
      difficulty: formData.difficulty ?? editingItem.difficulty ?? 1,
      estimated_minutes: formData.estimated_minutes ?? editingItem.estimated_minutes ?? 10,
      xp_reward: formData.xp_reward ?? editingItem.xp_reward ?? 50,
      order_number: formData.order_number ?? editingItem.order_number ?? 0,
      visible: formData.visible !== false,
      problem_references: formData.problem_references || editingItem.problem_references || [],
    };
    const res = await updateLesson(editingItem.id, lessonFields);
    if (res.success) {
      toast.success("Lesson updated");
      setEditingItem(null);
      setFormData({});
      if (selectedModule) loadLessons(selectedModule.id);
    } else {
      toast.error(res.error?.message || "Failed to update lesson");
    }
  };

  const handleDeleteLesson = async (id: string) => {
    setDeleteConfirm({ type: "lesson", id, name: lessons.find((l) => l.id === id)?.title || "this lesson" });
  };
  const executeDeleteLesson = async (id: string) => {
    const res = await deleteLesson(id);
    if (res.success) {
      toast.success("Lesson deleted");
      if (selectedLesson?.id === id) { setSelectedLesson(null); setProjects([]); }
      if (selectedModule) loadLessons(selectedModule.id);
    } else {
      toast.error(res.error?.message || "Failed to delete lesson");
    }
  };

  // ── Project handlers ──

  const handleCreateProject = async () => {
    if (!selectedLesson) return;
    const res = await createProject(selectedLesson.id, { ...formData, lesson_id: selectedLesson.id } as any);
    if (res.success) {
      toast.success("Project created");
      setShowProjectForm(false);
      setFormData({});
      loadProjects(selectedLesson.id);
    } else {
      toast.error(res.error?.message || "Failed to create project");
    }
  };

  const handleUpdateProject = async () => {
    if (!editingItem) return;
    const res = await updateProject(editingItem.id, formData as any);
    if (res.success) {
      toast.success("Project updated");
      setEditingItem(null);
      setFormData({});
      if (selectedLesson) loadProjects(selectedLesson.id);
    } else {
      toast.error(res.error?.message || "Failed to update project");
    }
  };

  const handleDeleteProject = async (id: string) => {
    setDeleteConfirm({ type: "project", id, name: projects.find((p) => p.id === id)?.title || "this project" });
  };
  const executeDeleteProject = async (id: string) => {
    const res = await deleteProject(id);
    if (res.success) {
      toast.success("Project deleted");
      if (selectedLesson) loadProjects(selectedLesson.id);
    } else {
      toast.error(res.error?.message || "Failed to delete project");
    }
  };

  // ── Section handlers ──

  const handleCreateSection = async () => {
    if (!selectedLesson) return;
    const payload: NewLessonSection = {
      section_type: formData.section_type || "explanation",
      title: formData.title || "",
      content: formData.content || "",
      order_number: formData.order_number ?? 0,
    };
    if (formData.metadata) payload.metadata = formData.metadata;
    const res = await createSection(selectedLesson.id, payload);
    if (res.success) {
      toast.success("Section created");
      setShowSectionForm(false);
      setFormData({});
      loadSections(selectedLesson.id);
    } else {
      toast.error(res.error?.message || "Failed to create section");
    }
  };

  const handleUpdateSection = async () => {
    if (!editingItem) return;
    const res = await updateSection(editingItem.id, formData as any);
    if (res.success) {
      toast.success("Section updated");
      setEditingItem(null);
      setFormData({});
      if (selectedLesson) loadSections(selectedLesson.id);
    } else {
      toast.error(res.error?.message || "Failed to update section");
    }
  };

  const handleDeleteSection = async (id: string) => {
    const res = await deleteSection(id);
    if (res.success) {
      toast.success("Section deleted");
      if (selectedLesson) loadSections(selectedLesson.id);
    } else {
      toast.error(res.error?.message || "Failed to delete section");
    }
  };

  // ── Quiz handlers ──

  const handleAddQuizQuestion = () => {
    const options = quizQuestionForm.optionsRaw.split("\n").map((s) => s.trim()).filter(Boolean);
    if (!quizQuestionForm.question.trim()) {
      toast.error("Question is required");
      return;
    }
    if (options.length < 2) {
      toast.error("At least 2 options are required");
      return;
    }
    const updated = [...(formData.quiz_questions || []), {
      question: quizQuestionForm.question.trim(),
      options,
      correct_index: quizQuestionForm.correctIndex,
      points: quizQuestionForm.points,
      explanation: quizQuestionForm.explanation.trim(),
    }];
    updateField("quiz_questions", updated);
    setQuizQuestionForm({ question: "", optionsRaw: "", correctIndex: 0, points: 1, explanation: "" });
    toast.success("Quiz question added");
  };

  // ── Form helpers ──

  const openCreateForm = (panel: Panel) => {
    setEditingItem(null);
    const defaults: Record<string, any> = { slug: "", title: "", order_number: 0 };
    if (panel === "lessons") {
      defaults.visible = true;
      defaults.difficulty = 1;
      defaults.xp_reward = 50;
      defaults.estimated_minutes = 10;
    }
    setFormData(defaults);
    if (panel === "courses") setShowCourseForm(true);
    else if (panel === "modules") setShowModuleForm(true);
    else if (panel === "lessons") setShowLessonForm(true);
    else if (panel === "projects") setShowProjectForm(true);
    else if (panel === "sections") setShowSectionForm(true);
  };

  const openEditForm = (item: any, panel: Panel) => {
    setEditingItem(item);
    const base = { ...item };
    if (panel === "sections") {
      base.content = item.content || "";
      base.section_type = item.section_type || "explanation";
    } else {
      delete base.content;
      delete base.section_type;
    }
    setFormData(base);
    if (panel === "courses") setShowCourseForm(true);
    else if (panel === "modules") setShowModuleForm(true);
    else if (panel === "lessons") setShowLessonForm(true);
    else if (panel === "projects") setShowProjectForm(true);
    else if (panel === "sections") setShowSectionForm(true);
  };

  const closeAllForms = () => {
    setShowCourseForm(false);
    setShowModuleForm(false);
    setShowLessonForm(false);
    setShowProjectForm(false);
    setShowSectionForm(false);
    setEditingItem(null);
    setFormData({});
  };

  const updateField = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const activeForm = showCourseForm ? "courses" : showModuleForm ? "modules" : showLessonForm ? "lessons" : showProjectForm ? "projects" : showSectionForm ? "sections" : null;
  const modalOpen = activeForm !== null;
  const formTitle = editingItem ? "Edit" : "Create";
  const formEntity = showCourseForm ? "Course" : showModuleForm ? "Module" : showLessonForm ? "Lesson" : showProjectForm ? "Project" : "Section";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-3">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground">Loading curriculum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Curriculum Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and organize courses, modules, lessons, and projects</p>
        </div>
        <Button onClick={() => openCreateForm("courses")} className="gap-1.5">
          <Plus className="h-4 w-4" /> New Course
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ── Courses Column ── */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Courses</h2>
            <span className="text-xs text-muted-foreground">{courses.length}</span>
          </div>
          <div className="space-y-2 max-h-[75vh] overflow-y-auto pr-1">
            {courses.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed rounded-xl">
                <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No courses yet</p>
                <Button size="sm" variant="outline" className="mt-3" onClick={() => openCreateForm("courses")}>
                  <Plus className="h-3 w-3 mr-1" /> Create Course
                </Button>
              </div>
            )}
            {courses.map((course) => (
              <AdminCourseCard
                key={course.id}
                course={course}
                isSelected={selectedCourse?.id === course.id}
                isExpanded={expandedCourse === course.id}
                onSelect={() => handleCourseSelect(course)}
                onEdit={() => openEditForm(course, "courses")}
                onDelete={() => handleDeleteCourse(course.id)}
                onToggleVisibility={() => handleToggleCourseVisibility(course)}
              >
                {expandedCourse === course.id && (
                  <div className="ml-3 mt-1 space-y-1 border-l-2 border-muted pl-3">
                    {loadingModules ? (
                      <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                        Loading modules...
                      </div>
                    ) : modules.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2 italic">No modules yet</p>
                    ) : null}
                    {modules.map((mod) => (
                      <AdminModuleCard
                        key={mod.id}
                        mod={mod}
                        isSelected={selectedModule?.id === mod.id}
                        onSelect={() => { setSelectedCourse(course); handleModuleSelect(mod); }}
                        onEdit={() => openEditForm(mod, "modules")}
                        onDelete={() => handleDeleteModule(mod.id)}
                        onToggleVisibility={() => handleToggleModuleVisibility(mod)}
                      />
                    ))}
                    <button
                      className="flex items-center gap-1 text-xs text-primary hover:underline p-1.5 w-full"
                      onClick={() => { setSelectedCourse(course); setSelectedModule(null); openCreateForm("modules"); }}
                    >
                      <Plus className="h-3 w-3" /> Add Module
                    </button>
                  </div>
                )}
              </AdminCourseCard>
            ))}
          </div>
        </div>

        {/* ── Middle Column: Lessons + Sections ── */}
        <div className="lg:col-span-2 space-y-4">
          {!selectedModule && (
            <div className="text-center py-16 border-2 border-dashed rounded-xl">
              <Layers className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Select a course and module to manage lessons</p>
            </div>
          )}

          {selectedModule && (
            <>
              {/* Module info header */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" />
                      <CardTitle className="text-base">{selectedModule.title}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">{lessons.length} lesson{lessons.length !== 1 ? "s" : ""}</Badge>
                      <Button size="sm" onClick={() => openCreateForm("lessons")}>
                        <Plus className="mr-1 h-3 w-3" /> New Lesson
                      </Button>
                    </div>
                  </div>
                  {selectedModule.description && (
                    <CardDescription className="text-xs">{selectedModule.description}</CardDescription>
                  )}
                </CardHeader>
              </Card>

              {/* Lessons list */}
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {loadingLessons ? (
                  <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                    Loading lessons...
                  </div>
                ) : lessons.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-xl">
                    <FileText className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No lessons in this module</p>
                  </div>
                ) : null}
                {lessons.map((lesson) => (
                  <AdminLessonCard
                    key={lesson.id}
                    lesson={lesson}
                    isSelected={selectedLesson?.id === lesson.id}
                    onSelect={() => handleLessonSelect(lesson)}
                    onEdit={() => openEditForm(lesson, "lessons")}
                    onDelete={() => handleDeleteLesson(lesson.id)}
                    onToggleVisibility={() => handleToggleLessonVisibility(lesson)}
                  />
                ))}
              </div>

              {/* Sections — shown when a lesson is selected */}
              {selectedLesson && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <ListOrdered className="h-4 w-4 text-primary" />
                        Sections
                        <Badge variant="outline" className="text-[10px]">{sections.length}</Badge>
                      </CardTitle>
                      <Button size="sm" variant="outline" onClick={() => openCreateForm("sections")}>
                        <Plus className="mr-1 h-3 w-3" /> Add Section
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="max-h-60 overflow-y-auto space-y-1.5">
                    {sections.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">No sections yet</p>
                    )}
                    {sections.map((sec, idx) => (
                      <div
                        key={sec.id}
                        className={`flex items-center justify-between p-2 rounded-lg border-l-2 transition-colors group hover:bg-muted/10 ${SECTION_TYPE_COLORS[sec.section_type] || "border-l-gray-300 bg-muted/20"}`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <GripVertical className="h-3 w-3 text-muted-foreground/30 shrink-0" />
                          <span className="text-[10px] text-muted-foreground font-mono shrink-0 w-4 text-right">{idx + 1}</span>
                          <span className="shrink-0 text-muted-foreground/60">
                            {SECTION_TYPE_ICONS[sec.section_type] || <FileText className="h-3.5 w-3.5" />}
                          </span>
                          <Badge variant="outline" className="text-[10px] shrink-0 font-mono">{sec.section_type}</Badge>
                          <span className="truncate text-xs">{sec.title || "Untitled"}</span>
                        </div>
                        <div className="flex gap-0.5 shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={async () => {
                              if (idx === 0) return;
                              const reordered = [...sections];
                              [reordered[idx - 1], reordered[idx]] = [reordered[idx], reordered[idx - 1]];
                              setSections(reordered);
                              if (selectedLesson) {
                                const ids = reordered.map((s) => s.id);
                                await reorderSections(selectedLesson.id, ids);
                              }
                            }}
                            disabled={idx === 0}
                            className="p-1 rounded hover:bg-muted transition-colors disabled:opacity-20"
                            title="Move up"
                          >
                            <ArrowUp className="h-3 w-3 text-muted-foreground" />
                          </button>
                          <button
                            onClick={async () => {
                              if (idx === sections.length - 1) return;
                              const reordered = [...sections];
                              [reordered[idx], reordered[idx + 1]] = [reordered[idx + 1], reordered[idx]];
                              setSections(reordered);
                              if (selectedLesson) {
                                const ids = reordered.map((s) => s.id);
                                await reorderSections(selectedLesson.id, ids);
                              }
                            }}
                            disabled={idx === sections.length - 1}
                            className="p-1 rounded hover:bg-muted transition-colors disabled:opacity-20"
                            title="Move down"
                          >
                            <ArrowDown className="h-3 w-3 text-muted-foreground" />
                          </button>
                          <button onClick={() => openEditForm(sec, "sections")} className="p-1 rounded hover:bg-muted transition-colors">
                            <Edit3 className="h-3 w-3 text-muted-foreground" />
                          </button>
                          <button onClick={() => handleDeleteSection(sec.id)} className="p-1 rounded hover:bg-red-50 transition-colors">
                            <Trash2 className="h-3 w-3 text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        {/* ── Right Column: Projects ── */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Projects</h2>
            <span className="text-xs text-muted-foreground">{projects.length}</span>
          </div>
          <div className="space-y-2 max-h-[75vh] overflow-y-auto pr-1">
            {!selectedLesson && (
              <div className="text-center py-8 border-2 border-dashed rounded-xl">
                <Beaker className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">Select a lesson to view projects</p>
              </div>
            )}
            {selectedLesson && projects.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed rounded-xl">
                <Beaker className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No projects</p>
                <Button size="sm" variant="outline" className="mt-2" onClick={() => openCreateForm("projects")}>
                  <Plus className="h-3 w-3 mr-1" /> Add Project
                </Button>
              </div>
            )}
            {projects.map((proj) => (
              <AdminProjectCard
                key={proj.id}
                project={proj}
                onEdit={() => openEditForm(proj, "projects")}
                onDelete={() => handleDeleteProject(proj.id)}
                onToggleVisibility={() => handleToggleProjectVisibility(proj)}
              />
            ))}
            {selectedLesson && projects.length > 0 && (
              <Button size="sm" variant="outline" className="w-full" onClick={() => openCreateForm("projects")}>
                <Plus className="h-3 w-3 mr-1" /> Add Project
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Dialogs ── */}
      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) closeAllForms(); }}>
        <DialogContent className={`sm:max-w-2xl max-h-[85vh] flex flex-col overflow-hidden ${showCourseForm ? "sm:max-w-2xl" : showLessonForm ? "sm:max-w-2xl" : showProjectForm ? "sm:max-w-xl" : "sm:max-w-lg"}`}>
          <DialogHeader className="shrink-0 border-b pb-3">
            <DialogTitle className="flex items-center gap-2 text-lg">
              {showCourseForm && <BookOpen className="h-5 w-5 text-primary" />}
              {showModuleForm && <Layers className="h-5 w-5 text-primary" />}
              {showLessonForm && <FileText className="h-5 w-5 text-primary" />}
              {showProjectForm && <Beaker className="h-5 w-5 text-primary" />}
              {showSectionForm && <ListOrdered className="h-5 w-5 text-primary" />}
              {formTitle} {formEntity}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4 min-h-0">
            {/* ── Course Form ── */}
            {showCourseForm && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title *</label>
                  <Input
                    placeholder="e.g. Introduction to Programming"
                    value={formData.title || ""}
                    onChange={(e) => updateField("title", e.target.value)}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Slug *</label>
                  <Input
                    placeholder="e.g. intro-to-programming"
                    value={formData.slug || ""}
                    onChange={(e) => updateField("slug", e.target.value)}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Order Number</label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={formData.order_number ?? 0}
                    onChange={(e) => updateField("order_number", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Difficulty Level</label>
                  <Select
                    value={String(formData.difficulty_level ?? 1)}
                    onValueChange={(v) => updateField("difficulty_level", parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((d) => (
                        <SelectItem key={d} value={String(d)}>
                          {d} — {["Beginner", "Elementary", "Intermediate", "Advanced", "Expert"][d - 1]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Estimated Hours</label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.estimated_hours ?? 0}
                    onChange={(e) => updateField("estimated_hours", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
                  <Textarea
                    placeholder="Course overview and learning objectives..."
                    className="min-h-[100px]"
                    value={formData.description || ""}
                    onChange={(e) => updateField("description", e.target.value)}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Image URL</label>
                  <Input
                    placeholder="https://example.com/image.webp"
                    value={formData.image_url || ""}
                    onChange={(e) => updateField("image_url", e.target.value || null)}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Icon</label>
                  <Input
                    placeholder="Icon identifier or URL"
                    value={formData.icon || ""}
                    onChange={(e) => updateField("icon", e.target.value || null)}
                  />
                </div>
              </div>
            )}

            {/* ── Module Form ── */}
            {showModuleForm && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title *</label>
                  <Input
                    placeholder="e.g. Variables & Data Types"
                    value={formData.title || ""}
                    onChange={(e) => updateField("title", e.target.value)}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Slug *</label>
                  <Input
                    placeholder="e.g. variables-data-types"
                    value={formData.slug || ""}
                    onChange={(e) => updateField("slug", e.target.value)}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Order Number</label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.order_number ?? 0}
                    onChange={(e) => updateField("order_number", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
                  <Textarea
                    placeholder="Module description..."
                    className="min-h-[80px]"
                    value={formData.description || ""}
                    onChange={(e) => updateField("description", e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Image URL</label>
                  <Input
                    placeholder="https://example.com/module-image.webp"
                    value={formData.image_url || ""}
                    onChange={(e) => updateField("image_url", e.target.value || null)}
                  />
                </div>
              </div>
            )}

            {/* ── Lesson Form (5-Tab Premium) ── */}
            {showLessonForm && (
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto gap-0">
                  {["General","Sections","Exercises","Quiz","Settings"].map((tab) => (
                    <TabsTrigger
                      key={tab.toLowerCase()}
                      value={tab.toLowerCase()}
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground pb-2.5 px-4 text-sm hover:text-foreground transition-colors"
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* ── General ── */}
                <TabsContent value="general" className="pt-4 outline-none">
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title *</label>
                        <Input
                          placeholder="e.g. Working with Strings"
                          value={formData.title || ""}
                          onChange={(e) => updateField("title", e.target.value)}
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Slug *</label>
                        <Input
                          placeholder="e.g. working-with-strings"
                          value={formData.slug || ""}
                          onChange={(e) => updateField("slug", e.target.value)}
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Difficulty</label>
                        <Select
                          value={String(formData.difficulty ?? 1)}
                          onValueChange={(v) => updateField("difficulty", parseInt(v))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((d) => (
                              <SelectItem key={d} value={String(d)}>
                                {d} — {["Beginner", "Easy", "Intermediate", "Hard", "Expert"][d - 1]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1">
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">XP Reward</label>
                        <Input
                          type="number"
                          min={0}
                          value={formData.xp_reward ?? 50}
                          onChange={(e) => updateField("xp_reward", parseInt(e.target.value) || 50)}
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Est. Minutes</label>
                        <Input
                          type="number"
                          min={1}
                          value={formData.estimated_minutes ?? 10}
                          onChange={(e) => updateField("estimated_minutes", parseInt(e.target.value) || 10)}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
                        <Textarea
                          placeholder="Lesson description and learning objectives..."
                          className="min-h-[80px]"
                          value={formData.description || ""}
                          onChange={(e) => updateField("description", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Collapsible markdown content */}
                    <details className="mt-4 group border rounded-lg overflow-hidden">
                      <summary className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground hover:bg-muted/20 transition-colors select-none">
                        <ChevronRight className="h-3.5 w-3.5 transition-transform group-open:rotate-90 shrink-0" />
                        Lesson Content (Markdown)
                      </summary>
                      <div className="border-t">
                        <div className="grid grid-cols-2 gap-0 h-[40vh] min-h-[200px]">
                          <div className="flex flex-col border-r">
                            <div className="px-4 py-2 bg-muted/10 border-b">
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Editor</span>
                            </div>
                            <Textarea
                              placeholder="Full lesson content in markdown..."
                              className="flex-1 min-h-0 font-mono text-xs resize-none rounded-none border-0 focus-visible:ring-0"
                              value={formData.raw_readme || ""}
                              onChange={(e) => updateField("raw_readme", e.target.value)}
                            />
                          </div>
                          <div className="flex flex-col">
                            <div className="px-4 py-2 bg-muted/10 border-b">
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Preview</span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4">
                              <MarkdownPreview content={formData.raw_readme || ""} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </details>
                  </motion.div>
                </TabsContent>

                {/* ── Sections ── */}
                <TabsContent value="sections" className="pt-4 outline-none">
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.05 }}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-muted-foreground">{sections.length} section{sections.length !== 1 ? "s" : ""}</p>
                        <Button size="sm" variant="outline" onClick={() => openCreateForm("sections")}>
                          <Plus className="h-3 w-3 mr-1" /> Add Section
                        </Button>
                      </div>
                      <div className="space-y-1.5 max-h-[40vh] min-h-[100px] overflow-y-auto pr-1">
                        {sections.length === 0 && (
                          <p className="text-xs text-muted-foreground text-center py-8 border-2 border-dashed rounded-xl">No sections yet. Add one to get started.</p>
                        )}
                        {sections.map((sec, idx) => (
                          <motion.div
                            key={sec.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex items-center justify-between p-2.5 rounded-lg border-l-2 group hover:bg-muted/10 ${SECTION_TYPE_COLORS[sec.section_type] || "border-l-gray-300 bg-muted/10"}`}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
                              <span className="shrink-0 text-muted-foreground/60">
                                {SECTION_TYPE_ICONS[sec.section_type] || <FileText className="h-3.5 w-3.5" />}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-mono shrink-0 w-4 text-right">{idx + 1}</span>
                              <Badge variant="outline" className="text-[10px] shrink-0 font-mono">{sec.section_type}</Badge>
                              <span className="truncate text-xs text-foreground/80">{sec.title || "Untitled"}</span>
                            </div>
                            <div className="flex gap-0.5 shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={async () => {
                                  if (idx === 0) return;
                                  const reordered = [...sections];
                                  [reordered[idx - 1], reordered[idx]] = [reordered[idx], reordered[idx - 1]];
                                  setSections(reordered);
                                  if (selectedLesson) {
                                    const ids = reordered.map((s) => s.id);
                                    await reorderSections(selectedLesson.id, ids);
                                  }
                                }}
                                disabled={idx === 0}
                                className="p-1 rounded hover:bg-muted transition-colors disabled:opacity-20"
                                title="Move up"
                              >
                                <ArrowUp className="h-3 w-3 text-muted-foreground" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (idx === sections.length - 1) return;
                                  const reordered = [...sections];
                                  [reordered[idx], reordered[idx + 1]] = [reordered[idx + 1], reordered[idx]];
                                  setSections(reordered);
                                  if (selectedLesson) {
                                    const ids = reordered.map((s) => s.id);
                                    await reorderSections(selectedLesson.id, ids);
                                  }
                                }}
                                disabled={idx === sections.length - 1}
                                className="p-1 rounded hover:bg-muted transition-colors disabled:opacity-20"
                                title="Move down"
                              >
                                <ArrowDown className="h-3 w-3 text-muted-foreground" />
                              </button>
                              <button onClick={() => openEditForm(sec, "sections")} className="p-1 rounded hover:bg-muted transition-colors">
                                <Edit3 className="h-3 w-3 text-muted-foreground" />
                              </button>
                              <button onClick={() => handleDeleteSection(sec.id)} className="p-1 rounded hover:bg-red-50 transition-colors">
                                <Trash2 className="h-3 w-3 text-red-400" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>

                {/* ── Exercises ── */}
                <TabsContent value="exercises" className="pt-4 outline-none">
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.1 }}>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Attach Problems</h4>
                        <p className="text-xs text-muted-foreground">Search and select problems to attach to this lesson. Students will practice these in exercise sections.</p>
                      </div>
                      <ProblemBank
                        selectedSlugs={formData.problem_references || []}
                        onToggleSlug={(slug: string) => {
                          const current: string[] = formData.problem_references || [];
                          const idx = current.indexOf(slug);
                          if (idx >= 0) {
                            updateField("problem_references", current.filter((s) => s !== slug));
                          } else {
                            updateField("problem_references", [...current, slug]);
                          }
                        }}
                      />
                    </div>
                  </motion.div>
                </TabsContent>

                {/* ── Quiz ── */}
                <TabsContent value="quiz" className="pt-4 outline-none">
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.15 }}>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Quiz Questions</h4>
                        <p className="text-xs text-muted-foreground">Manage quiz questions for this lesson.</p>
                      </div>
                      <div className="space-y-2 max-h-[40vh] min-h-[100px] overflow-y-auto pr-1">
                        {(formData.quiz_questions?.length ?? 0) === 0 && (
                          <p className="text-xs text-muted-foreground text-center py-8 border-2 border-dashed rounded-xl">No quiz questions yet. Add one below.</p>
                        )}
                        {(formData.quiz_questions || []).map((q: any, i: number) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 rounded-lg border space-y-2 bg-muted/5 group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-medium">
                                <span className="text-muted-foreground font-mono mr-1.5">Q{i + 1}.</span>
                                {q.question}
                              </p>
                              <button
                                onClick={() => {
                                  const updated = [...(formData.quiz_questions || [])];
                                  updated.splice(i, 1);
                                  updateField("quiz_questions", updated);
                                }}
                                className="p-1 rounded hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                              >
                                <Trash2 className="h-3 w-3 text-red-400" />
                              </button>
                            </div>
                            <div className="space-y-0.5 ml-4">
                              {q.options.map((opt: string, oi: number) => (
                                <p key={oi} className={`text-[11px] ${oi === q.correct_index ? "text-green-600 font-medium" : "text-muted-foreground"}`}>
                                  <span className="mr-1">{oi === q.correct_index ? "✓" : "·"}</span>
                                  {opt}
                                </p>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      {/* Add question inline form */}
                      <div className="border rounded-lg p-4 space-y-3 bg-muted/5">
                        <p className="text-xs font-semibold flex items-center gap-1.5">
                          <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                          New Question
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2">
                            <label className="text-[11px] text-muted-foreground mb-1 block">Question</label>
                            <Input
                              placeholder="What does the following code output?"
                              value={quizQuestionForm.question}
                              onChange={(e) => setQuizQuestionForm((prev) => ({ ...prev, question: e.target.value }))}
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="text-[11px] text-muted-foreground mb-1 block">Options (one per line)</label>
                            <Textarea
                              placeholder={`Option A\nOption B\nOption C\nOption D`}
                              className="min-h-[72px] font-mono text-xs"
                              value={quizQuestionForm.optionsRaw}
                              onChange={(e) => setQuizQuestionForm((prev) => ({ ...prev, optionsRaw: e.target.value }))}
                            />
                          </div>
                          <div className="col-span-1">
                            <label className="text-[11px] text-muted-foreground mb-1 block">Correct Index (0-based)</label>
                            <Input
                              type="number"
                              min={0}
                              value={quizQuestionForm.correctIndex}
                              onChange={(e) => setQuizQuestionForm((prev) => ({ ...prev, correctIndex: parseInt(e.target.value) || 0 }))}
                            />
                          </div>
                          <div className="col-span-1">
                            <label className="text-[11px] text-muted-foreground mb-1 block">Points</label>
                            <Input
                              type="number"
                              min={1}
                              value={quizQuestionForm.points}
                              onChange={(e) => setQuizQuestionForm((prev) => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="text-[11px] text-muted-foreground mb-1 block">Explanation</label>
                            <Textarea
                              placeholder="Explain why the correct answer is right..."
                              className="min-h-[60px]"
                              value={quizQuestionForm.explanation}
                              onChange={(e) => setQuizQuestionForm((prev) => ({ ...prev, explanation: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button size="sm" onClick={handleAddQuizQuestion} className="gap-1">
                            <Plus className="h-3 w-3" /> Add Question
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>

                {/* ── Settings ── */}
                <TabsContent value="settings" className="pt-4 outline-none">
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.2 }}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
                        <div>
                          <p className="text-sm font-medium">Published</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Make this lesson visible to students</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.visible !== false}
                            onChange={(e) => updateField("visible", e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-6 bg-muted-foreground/30 rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm" />
                        </label>
                      </div>
                      <div className="p-4 rounded-xl border bg-card">
                        <label className="text-xs font-medium text-muted-foreground mb-2 block">Order Number</label>
                        <Input
                          type="number"
                          min={0}
                          value={formData.order_number ?? 0}
                          onChange={(e) => updateField("order_number", parseInt(e.target.value) || 0)}
                          className="w-24"
                        />
                        <p className="text-[11px] text-muted-foreground mt-1.5">Controls the display order among lessons in this module</p>
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>
              </Tabs>
            )}

            {/* ── Project Form ── */}
            {showProjectForm && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title *</label>
                  <Input
                    placeholder="e.g. Build a Calculator"
                    value={formData.title || ""}
                    onChange={(e) => updateField("title", e.target.value)}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Slug *</label>
                  <Input
                    placeholder="e.g. build-a-calculator"
                    value={formData.slug || ""}
                    onChange={(e) => updateField("slug", e.target.value)}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Order Number</label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.order_number ?? 0}
                    onChange={(e) => updateField("order_number", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Difficulty</label>
                  <Select
                    value={String(formData.difficulty ?? 1)}
                    onValueChange={(v) => updateField("difficulty", parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((d) => (
                        <SelectItem key={d} value={String(d)}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">XP Reward</label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.xp_reward ?? 100}
                    onChange={(e) => updateField("xp_reward", parseInt(e.target.value) || 100)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
                  <Textarea
                    placeholder="Project description..."
                    className="min-h-[80px]"
                    value={formData.description || ""}
                    onChange={(e) => updateField("description", e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Requirements</label>
                  <Textarea
                    placeholder="Functional requirements..."
                    className="min-h-[80px]"
                    value={formData.requirements || ""}
                    onChange={(e) => updateField("requirements", e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Starter Code</label>
                  <Textarea
                    placeholder="Initial code scaffold..."
                    className="min-h-[100px] font-mono text-xs"
                    value={formData.starter_code || ""}
                    onChange={(e) => updateField("starter_code", e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Hints (comma-separated)</label>
                  <Input
                    placeholder="Try breaking the problem down, Consider edge cases, Use a helper function"
                    value={Array.isArray(formData.hints) ? formData.hints.join(", ") : (formData.hints || "")}
                    onChange={(e) => updateField("hints", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))}
                  />
                </div>
              </div>
            )}

            {/* ── Section Form ── */}
            {showSectionForm && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title</label>
                    <Input
                      placeholder="Section title"
                      value={formData.title || ""}
                      onChange={(e) => updateField("title", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Type *</label>
                    <Select
                      value={formData.section_type || "explanation"}
                      onValueChange={(v) => updateField("section_type", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Section type" />
                      </SelectTrigger>
                      <SelectContent>
                        {SECTION_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Order Number</label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.order_number ?? 0}
                      onChange={(e) => updateField("order_number", parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Content (markdown)</label>
                    <Textarea
                      placeholder="Write your content in markdown..."
                      className="min-h-[150px] font-mono text-xs"
                      value={formData.content || ""}
                      onChange={(e) => updateField("content", e.target.value)}
                    />
                  </div>
                </div>

                {formData.section_type === "quiz" && (
                  <div className="border rounded-lg p-4 space-y-3 bg-muted/20">
                    <p className="text-xs font-semibold flex items-center gap-1.5">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                      Quiz Configuration
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-[11px] text-muted-foreground mb-1 block">Question</label>
                        <Input
                          placeholder="What does the following code output?"
                          value={(formData.metadata as any)?.question || ""}
                          onChange={(e) => updateField("metadata", { ...((formData.metadata as any) || {}), question: e.target.value })}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[11px] text-muted-foreground mb-1 block">Options (comma-separated)</label>
                        <Input
                          placeholder="Option A, Option B, Option C, Option D"
                          value={((formData.metadata as any)?.options || []).join(", ")}
                          onChange={(e) => updateField("metadata", { ...((formData.metadata as any) || {}), options: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })}
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-[11px] text-muted-foreground mb-1 block">Correct Option (0-based)</label>
                        <Input
                          type="number"
                          min={0}
                          value={(formData.metadata as any)?.correct_index ?? ""}
                          onChange={(e) => updateField("metadata", { ...((formData.metadata as any) || {}), correct_index: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-[11px] text-muted-foreground mb-1 block">Points</label>
                        <Input
                          type="number"
                          min={1}
                          value={(formData.metadata as any)?.points ?? ""}
                          onChange={(e) => updateField("metadata", { ...((formData.metadata as any) || {}), points: parseInt(e.target.value) || 1 })}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[11px] text-muted-foreground mb-1 block">Explanation</label>
                        <Textarea
                          placeholder="Explain why the correct answer is right..."
                          className="min-h-[60px]"
                          value={(formData.metadata as any)?.explanation || ""}
                          onChange={(e) => updateField("metadata", { ...((formData.metadata as any) || {}), explanation: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 shrink-0 border-t pt-3">
            <Button variant="outline" onClick={closeAllForms}>Cancel</Button>
            <Button onClick={() => {
              if (showCourseForm) editingItem ? handleUpdateCourse() : handleCreateCourse();
              else if (showModuleForm) editingItem ? handleUpdateModule() : handleCreateModule();
              else if (showLessonForm) editingItem ? handleUpdateLesson() : handleCreateLesson();
              else if (showProjectForm) editingItem ? handleUpdateProject() : handleCreateProject();
              else if (showSectionForm) editingItem ? handleUpdateSection() : handleCreateSection();
            }}>
              {editingItem ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <span className="font-medium text-foreground">{deleteConfirm?.name}</span>?
              {deleteConfirm?.type === "course" && " This will also delete all modules, lessons, sections, and projects within it."}
              {deleteConfirm?.type === "module" && " This will also delete all lessons, sections, and projects within it."}
              {deleteConfirm?.type === "lesson" && " This will also delete all sections and projects within it."}
              {deleteConfirm?.type === "project" && " This action cannot be undone."}
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!deleteConfirm) return;
                const { type, id } = deleteConfirm;
                if (type === "course") executeDeleteCourse(id);
                else if (type === "module") executeDeleteModule(id);
                else if (type === "lesson") executeDeleteLesson(id);
                else if (type === "project") executeDeleteProject(id);
                setDeleteConfirm(null);
              }}
            >
              Delete {deleteConfirm?.type}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
