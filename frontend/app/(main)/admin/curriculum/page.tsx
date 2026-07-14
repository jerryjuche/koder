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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/lib/toast";
import { Plus, Edit3, Trash2, Eye, EyeOff, ChevronRight, ChevronDown } from "lucide-react";

type Panel = "courses" | "modules" | "lessons" | "projects" | "sections";

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
    if (res.success && res.data) {
      setCourses(res.data);
    }
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
    if (expandedCourse !== course.id) {
      loadModules(course.id);
    }
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

  const handleModuleSelect = (module: Module) => {
    setSelectedModule(module);
    setSelectedLesson(null);
    loadLessons(module.id);
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
    const payload = {
      lesson: { ...formData, module_id: selectedModule.id },
    };
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
    if (formData.metadata) {
      payload.metadata = formData.metadata;
    }
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

  // ── Render ──

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading curriculum...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Curriculum Manager</h1>
          <p className="text-sm text-muted-foreground">Create and manage courses, modules, lessons, and projects</p>
        </div>
        <Button onClick={() => openCreateForm("courses")}><Plus className="mr-1 h-4 w-4" /> New Course</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ── Courses Column ── */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-lg">Courses</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-[70vh] overflow-y-auto">
            {courses.length === 0 && <p className="text-sm text-muted-foreground">No courses yet</p>}
            {courses.map((course) => (
              <div key={course.id}>
                <div
                  className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-accent ${selectedCourse?.id === course.id ? "bg-accent" : ""}`}
                  onClick={() => handleCourseSelect(course)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {expandedCourse === course.id ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                    <span className="text-sm truncate">{course.title}</span>
                    {course.visible ? <Eye className="h-3 w-3 text-green-500 shrink-0" /> : <EyeOff className="h-3 w-3 text-muted-foreground shrink-0" />}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); openEditForm(course, "courses"); }}><Edit3 className="h-3 w-3" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.id); }}><Trash2 className="h-3 w-3 text-red-400" /></button>
                  </div>
                </div>

                {/* Modules nested under course */}
                {expandedCourse === course.id && (
                  <div className="ml-4 mt-1 space-y-1 border-l pl-3">
                    {modules.map((mod) => (
                      <div
                        key={mod.id}
                        className={`flex items-center justify-between p-1.5 rounded cursor-pointer text-sm hover:bg-accent/50 ${selectedModule?.id === mod.id ? "bg-accent/50" : ""}`}
                        onClick={() => { setSelectedCourse(course); handleModuleSelect(mod); }}
                      >
                        <span className="truncate">{mod.title}</span>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={(e) => { e.stopPropagation(); openEditForm(mod, "modules"); }}><Edit3 className="h-3 w-3" /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteModule(mod.id); }}><Trash2 className="h-3 w-3 text-red-400" /></button>
                        </div>
                      </div>
                    ))}
                    <button
                      className="flex items-center gap-1 text-xs text-primary hover:underline p-1"
                      onClick={() => { setSelectedCourse(course); setSelectedModule(null); openCreateForm("modules"); }}
                    >
                      <Plus className="h-3 w-3" /> Add Module
                    </button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Middle Column: Lessons (when module selected) ── */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>{selectedModule ? `Lessons: ${selectedModule.title}` : "Lessons"}</span>
              {selectedModule && <Button size="sm" onClick={() => openCreateForm("lessons")}><Plus className="mr-1 h-3 w-3" /> New</Button>}
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[70vh] overflow-y-auto space-y-2">
            {!selectedModule && <p className="text-sm text-muted-foreground">Select a module to view lessons</p>}
            {selectedModule && lessons.length === 0 && <p className="text-sm text-muted-foreground">No lessons in this module</p>}
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className={`flex items-center justify-between p-3 rounded cursor-pointer border hover:bg-accent/30 ${selectedLesson?.id === lesson.id ? "border-primary bg-accent/30" : "border-border"}`}
                onClick={() => handleLessonSelect(lesson)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{lesson.title}</span>
                    <Badge variant="outline" className="text-xs">Diff {lesson.difficulty}</Badge>
                    <span className="text-xs text-muted-foreground">{lesson.estimated_minutes}min</span>
                    <span className="text-xs text-amber-500">{lesson.xp_reward} XP</span>
                    {lesson.visible ? <Eye className="h-3 w-3 text-green-500" /> : <EyeOff className="h-3 w-3 text-muted-foreground" />}
                  </div>
                  {lesson.description && <p className="text-xs text-muted-foreground truncate mt-1">{lesson.description}</p>}
                </div>
                <div className="flex gap-1 shrink-0 ml-2">
                  <button onClick={(e) => { e.stopPropagation(); openEditForm(lesson, "lessons"); }}><Edit3 className="h-3 w-3" /></button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteLesson(lesson.id); }}><Trash2 className="h-3 w-3 text-red-400" /></button>
                </div>
              </div>
            ))}
          </CardContent>

          {/* Sections list — shown when a lesson is selected */}
          {selectedLesson && (
            <CardContent className="border-t pt-4 mt-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Sections ({sections.length})</h3>
                <Button size="sm" variant="outline" onClick={() => openCreateForm("sections")}>
                  <Plus className="mr-1 h-3 w-3" /> Add Section
                </Button>
              </div>
              {sections.length === 0 && <p className="text-xs text-muted-foreground">No sections yet</p>}
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {sections.map((sec, idx) => (
                  <div key={sec.id} className="flex items-center justify-between p-2 rounded border border-border text-sm">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-xs text-muted-foreground shrink-0">{idx + 1}.</span>
                      <Badge variant="outline" className="text-[10px] shrink-0">{sec.section_type}</Badge>
                      <span className="truncate text-xs">{sec.title || "Untitled"}</span>
                    </div>
                    <div className="flex gap-1 shrink-0 ml-2">
                      <button onClick={() => openEditForm(sec, "sections")}><Edit3 className="h-3 w-3" /></button>
                      <button onClick={() => handleDeleteSection(sec.id)}><Trash2 className="h-3 w-3 text-red-400" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* ── Right Column: Projects (when lesson selected) ── */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Projects</span>
              {selectedLesson && <Button size="sm" onClick={() => openCreateForm("projects")}><Plus className="mr-1 h-3 w-3" /> New</Button>}
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[70vh] overflow-y-auto space-y-2">
            {!selectedLesson && <p className="text-sm text-muted-foreground">Select a lesson to view its projects</p>}
            {selectedLesson && projects.length === 0 && <p className="text-sm text-muted-foreground">No projects for this lesson</p>}
            {projects.map((proj) => (
              <div key={proj.id} className="flex items-center justify-between p-2 rounded border border-border">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{proj.title}</span>
                    <Badge variant="outline" className="text-xs">{proj.difficulty}</Badge>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0 ml-2">
                  <button onClick={() => openEditForm(proj, "projects")}><Edit3 className="h-3 w-3" /></button>
                  <button onClick={() => handleDeleteProject(proj.id)}><Trash2 className="h-3 w-3 text-red-400" /></button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── Course Form Modal ── */}
      {(showCourseForm || showModuleForm || showLessonForm || showProjectForm || showSectionForm) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={closeAllForms}>
          <div className="bg-background rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">
              {editingItem ? "Edit" : "Create"}{" "}
              {showCourseForm ? "Course" : showModuleForm ? "Module" : showLessonForm ? "Lesson" : showSectionForm ? "Section" : "Project"}
            </h2>
            <div className="space-y-3">
              {!showSectionForm && (
                <Input placeholder="Slug" value={formData.slug || ""} onChange={(e) => updateField("slug", e.target.value)} />
              )}
              <Input placeholder="Title" value={formData.title || ""} onChange={(e) => updateField("title", e.target.value)} />
              {(showLessonForm || showCourseForm) && (
                <Textarea placeholder="Description" value={formData.description || ""} onChange={(e) => updateField("description", e.target.value)} />
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Order</label>
                  <Input type="number" value={formData.order_number ?? 0} onChange={(e) => updateField("order_number", parseInt(e.target.value) || 0)} />
                </div>
                {showLessonForm && (
                  <>
                    <div>
                      <label className="text-xs text-muted-foreground">Difficulty (1-5)</label>
                      <Input type="number" min={1} max={5} value={formData.difficulty ?? 1} onChange={(e) => updateField("difficulty", parseInt(e.target.value) || 1)} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Est. Minutes</label>
                      <Input type="number" value={formData.estimated_minutes ?? 10} onChange={(e) => updateField("estimated_minutes", parseInt(e.target.value) || 10)} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">XP Reward</label>
                      <Input type="number" value={formData.xp_reward ?? 50} onChange={(e) => updateField("xp_reward", parseInt(e.target.value) || 50)} />
                    </div>
                  </>
                )}
                {showProjectForm && (
                  <>
                    <div>
                      <label className="text-xs text-muted-foreground">Difficulty (1-5)</label>
                      <Input type="number" min={1} max={5} value={formData.difficulty ?? 1} onChange={(e) => updateField("difficulty", parseInt(e.target.value) || 1)} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">XP Reward</label>
                      <Input type="number" value={formData.xp_reward ?? 100} onChange={(e) => updateField("xp_reward", parseInt(e.target.value) || 100)} />
                    </div>
                  </>
                )}
                {showCourseForm && (
                  <div>
                    <label className="text-xs text-muted-foreground">Est. Hours</label>
                    <Input type="number" value={formData.estimated_hours ?? 0} onChange={(e) => updateField("estimated_hours", parseInt(e.target.value) || 0)} />
                  </div>
                )}
              </div>
              {showSectionForm && (
                <>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.section_type || "explanation"}
                    onChange={(e) => updateField("section_type", e.target.value)}
                  >
                    {["overview","explanation","examples","best_practices","common_mistakes","summary","quiz","exercises","mini_project","assessment","ai_review"].map(t => (
                      <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                  <Textarea placeholder="Content (markdown)" value={formData.content || ""} onChange={(e) => updateField("content", e.target.value)} />
                  {formData.section_type === "quiz" && (
                    <div className="space-y-2 border rounded p-3">
                      <p className="text-xs font-medium">Quiz Metadata</p>
                      <Input placeholder="Question" value={(formData.metadata as any)?.question || ""} onChange={(e) => updateField("metadata", { ...((formData.metadata as any) || {}), question: e.target.value })} />
                      <Input placeholder="Options (comma-separated)" value={((formData.metadata as any)?.options || []).join(", ")} onChange={(e) => updateField("metadata", { ...((formData.metadata as any) || {}), options: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })} />
                      <Input type="number" placeholder="Correct option index (0-based)" value={(formData.metadata as any)?.correct_index ?? ""} onChange={(e) => updateField("metadata", { ...((formData.metadata as any) || {}), correct_index: parseInt(e.target.value) || 0 })} />
                      <Textarea placeholder="Explanation" value={(formData.metadata as any)?.explanation || ""} onChange={(e) => updateField("metadata", { ...((formData.metadata as any) || {}), explanation: e.target.value })} />
                    </div>
                  )}
                </>
              )}
              {(showLessonForm || showProjectForm) && (
                <Textarea placeholder="Description" value={formData.description || ""} onChange={(e) => updateField("description", e.target.value)} />
              )}
              {showProjectForm && (
                <>
                  <Textarea placeholder="Requirements" value={formData.requirements || ""} onChange={(e) => updateField("requirements", e.target.value)} />
                  <Textarea placeholder="Starter code" value={formData.starter_code || ""} onChange={(e) => updateField("starter_code", e.target.value)} />
                </>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={closeAllForms}>Cancel</Button>
              <Button onClick={() => {
                if (showCourseForm) editingItem ? handleUpdateCourse() : handleCreateCourse();
                else if (showModuleForm) editingItem ? handleUpdateModule() : handleCreateModule();
                else if (showLessonForm) editingItem ? handleUpdateLesson() : handleCreateLesson();
                else if (showProjectForm) editingItem ? handleUpdateProject() : handleCreateProject();
                else if (showSectionForm) editingItem ? handleUpdateSection() : handleCreateSection();
              }}>
                {editingItem ? "Save" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
