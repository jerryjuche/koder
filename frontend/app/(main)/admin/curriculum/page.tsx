"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchAllCourses, createCourse, updateCourse, deleteCourse,
  fetchModules, createModule, updateModule, deleteModule,
  fetchLessons, createLesson, updateLesson, deleteLesson,
  fetchProjects, createProject, updateProject, deleteProject,
  createSection, updateSection, deleteSection,
} from "@/lib/api";
import {
  Course, Module, Lesson, LessonSection, Project, NewLessonSection,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/lib/toast";
import {
  Plus, Edit3, Trash2, BookOpen, Layers, FileText, Beaker, Layout,
  ChevronRight, ChevronDown, Clock, Zap, Eye, EyeOff, Image, Hash,
  ArrowRight, GraduationCap, ListOrdered, Lightbulb, Code, Database,
} from "lucide-react";

type Panel = "courses" | "modules" | "lessons" | "projects" | "sections";

const SECTION_TYPES = [
  "overview", "explanation", "examples", "best_practices",
  "common_mistakes", "summary", "quiz", "exercises",
  "mini_project", "assessment", "ai_review",
];

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
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  // Form states
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

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
    const res = await fetchModules(courseId);
    if (res.success && res.data) setModules(res.data);
  }, []);

  const loadLessons = useCallback(async (moduleId: string) => {
    const res = await fetchLessons(moduleId);
    if (res.success && res.data) setLessons(res.data);
  }, []);

  const loadProjects = useCallback(async (lessonId: string) => {
    const res = await fetchProjects(lessonId);
    if (res.success && res.data) setProjects(res.data);
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

  const handleDeleteCourse = async (id: string) => {
    const res = await deleteCourse(id);
    if (res.success) {
      toast.success("Course deleted");
      if (selectedCourse?.id === id) {
        setSelectedCourse(null);
        setModules([]);
      }
      loadCourses();
    } else {
      toast.error(res.error?.message || "Failed to delete course");
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
    const res = await deleteModule(id);
    if (res.success) {
      toast.success("Module deleted");
      if (selectedModule?.id === id) {
        setSelectedModule(null);
        setLessons([]);
      }
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
    const payload = { lesson: { ...formData, module_id: selectedModule.id } };
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
    const res = await updateLesson(editingItem.id, formData as any);
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
    const res = await deleteLesson(id);
    if (res.success) {
      toast.success("Lesson deleted");
      if (selectedLesson?.id === id) {
        setSelectedLesson(null);
        setProjects([]);
      }
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

  // ── Form helpers ──

  const openCreateForm = (panel: Panel) => {
    setEditingItem(null);
    setFormData({ slug: "", title: "", order_number: 0 });
    if (panel === "courses") setShowCourseForm(true);
    else if (panel === "modules") setShowModuleForm(true);
    else if (panel === "lessons") setShowLessonForm(true);
    else if (panel === "projects") setShowProjectForm(true);
    else if (panel === "sections") setShowSectionForm(true);
  };

  const openEditForm = (item: any, panel: Panel) => {
    setEditingItem(item);
    setFormData({ ...item, content: item.content || "", section_type: item.section_type || "explanation" });
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
              <div key={course.id}>
                <Card
                  className={`cursor-pointer transition-all hover:shadow-md overflow-hidden ${
                    selectedCourse?.id === course.id ? "ring-2 ring-primary/30 shadow-md" : ""
                  }`}
                  onClick={() => handleCourseSelect(course)}
                >
                  <div className="relative">
                    <div className={`h-20 flex items-center justify-center ${
                      course.image_url
                        ? "bg-gradient-to-br from-primary/10 via-primary/5 to-background"
                        : "bg-gradient-to-br from-primary/10 to-muted"
                    }`}>
                      {course.image_url ? (
                        <div className="h-12 w-12 rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden">
                          <BookOpen className="h-6 w-6 text-primary/40" />
                        </div>
                      ) : (
                        <BookOpen className="h-8 w-8 text-primary/30" />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <div className={`p-1 rounded-full ${course.visible ? "bg-green-500/20 text-green-500" : "bg-muted text-muted-foreground"}`}>
                        {course.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{course.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{course.slug}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge variant="secondary" className="text-[10px]">
                            {course.difficulty_level ?? 1}/5
                          </Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Clock className="h-3 w-3" /> {course.estimated_hours ?? 0}h
                          </span>
                        </div>
                      </div>
                      {expandedCourse === course.id && (
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-1" />
                      )}
                      {expandedCourse !== course.id && (
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-1" />
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-2 pt-0 flex justify-end gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEditForm(course, "courses"); }}>
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:text-red-500" onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.id); }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </CardFooter>
                </Card>

                {/* Modules nested under course */}
                {expandedCourse === course.id && (
                  <div className="ml-3 mt-1 space-y-1 border-l-2 border-muted pl-3">
                    {modules.length === 0 && (
                      <p className="text-xs text-muted-foreground py-2 italic">No modules yet</p>
                    )}
                    {modules.map((mod) => (
                      <div
                        key={mod.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-sm transition-colors ${
                          selectedModule?.id === mod.id
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted/50 text-foreground"
                        }`}
                        onClick={() => { setSelectedCourse(course); handleModuleSelect(mod); }}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Layers className="h-3 w-3 shrink-0 opacity-60" />
                          <span className="truncate text-xs font-medium">{mod.title}</span>
                        </div>
                        <div className="flex gap-0.5 shrink-0 ml-1">
                          <button onClick={(e) => { e.stopPropagation(); openEditForm(mod, "modules"); }}>
                            <Edit3 className="h-3 w-3 opacity-50 hover:opacity-100" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteModule(mod.id); }}>
                            <Trash2 className="h-3 w-3 text-red-400 opacity-50 hover:opacity-100" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      className="flex items-center gap-1 text-xs text-primary hover:underline p-1.5 w-full"
                      onClick={() => { setSelectedCourse(course); setSelectedModule(null); openCreateForm("modules"); }}
                    >
                      <Plus className="h-3 w-3" /> Add Module
                    </button>
                  </div>
                )}
              </div>
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
                {lessons.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed rounded-xl">
                    <FileText className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No lessons in this module</p>
                  </div>
                )}
                {lessons.map((lesson) => (
                  <Card
                    key={lesson.id}
                    className={`cursor-pointer transition-all hover:shadow-sm overflow-hidden ${
                      selectedLesson?.id === lesson.id ? "ring-2 ring-primary/20 shadow-sm" : ""
                    }`}
                    onClick={() => handleLessonSelect(lesson)}
                  >
                    <CardContent className="p-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="font-medium text-sm truncate">{lesson.title}</span>
                            {lesson.visible ? (
                              <Eye className="h-3 w-3 text-green-500 shrink-0" />
                            ) : (
                              <EyeOff className="h-3 w-3 text-muted-foreground shrink-0" />
                            )}
                          </div>
                          {lesson.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{lesson.description}</p>
                          )}
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge variant="secondary" className="text-[10px]">Diff {lesson.difficulty}</Badge>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                              <Clock className="h-3 w-3" /> {lesson.estimated_minutes}min
                            </span>
                            <span className="text-[11px] text-amber-500 flex items-center gap-0.5">
                              <Zap className="h-3 w-3" /> {lesson.xp_reward} XP
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEditForm(lesson, "lessons"); }}>
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400" onClick={(e) => { e.stopPropagation(); handleDeleteLesson(lesson.id); }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
                      <div key={sec.id} className="flex items-center justify-between p-2 rounded-lg border bg-muted/20">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-[11px] text-muted-foreground font-mono shrink-0">{idx + 1}.</span>
                          <Badge variant="outline" className="text-[10px] shrink-0 font-mono">{sec.section_type}</Badge>
                          <span className="truncate text-xs">{sec.title || "Untitled"}</span>
                        </div>
                        <div className="flex gap-1 shrink-0 ml-2">
                          <button onClick={() => openEditForm(sec, "sections")}><Edit3 className="h-3 w-3 opacity-50 hover:opacity-100" /></button>
                          <button onClick={() => handleDeleteSection(sec.id)}><Trash2 className="h-3 w-3 text-red-400 opacity-50 hover:opacity-100" /></button>
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
              <Card key={proj.id} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{proj.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{proj.slug}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="secondary" className="text-[10px]">Diff {proj.difficulty}</Badge>
                        <span className="text-[10px] text-amber-500 flex items-center gap-0.5">
                          <Zap className="h-3 w-3" /> {proj.xp_reward} XP
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditForm(proj, "projects")}>
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400" onClick={() => handleDeleteProject(proj.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
        <DialogContent className={`sm:max-w-2xl ${showCourseForm ? "sm:max-w-2xl" : showLessonForm ? "sm:max-w-2xl" : showProjectForm ? "sm:max-w-xl" : "sm:max-w-lg"}`}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              {showCourseForm && <BookOpen className="h-5 w-5 text-primary" />}
              {showModuleForm && <Layers className="h-5 w-5 text-primary" />}
              {showLessonForm && <FileText className="h-5 w-5 text-primary" />}
              {showProjectForm && <Beaker className="h-5 w-5 text-primary" />}
              {showSectionForm && <ListOrdered className="h-5 w-5 text-primary" />}
              {formTitle} {formEntity}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
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

            {/* ── Lesson Form ── */}
            {showLessonForm && (
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
                    value={formData.xp_reward ?? 50}
                    onChange={(e) => updateField("xp_reward", parseInt(e.target.value) || 50)}
                  />
                </div>
                <div className="col-span-1">
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
                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Problem References</label>
                  <Input
                    placeholder="Comma-separated problem slugs: itoa, fizzbuzz, fibonacci"
                    value={Array.isArray(formData.problem_references) ? formData.problem_references.join(", ") : (formData.problem_references || "")}
                    onChange={(e) => updateField("problem_references", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))}
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Link existing problems to exercise sections</p>
                </div>
              </div>
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

          <DialogFooter className="gap-2">
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
    </div>
  );
}
