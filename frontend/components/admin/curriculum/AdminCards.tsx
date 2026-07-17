"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, Layers, FileText, Beaker, Clock, Zap, Eye, EyeOff,
  Edit3, Trash2, GripVertical, ChevronRight, ChevronDown,
} from "lucide-react";
import type { Course, Module, Lesson, Project } from "@/lib/types";

// ── Difficulty helpers ──

const DIFF_META: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: "Beginner", color: "text-emerald-400", bg: "bg-emerald-500/15" },
  2: { label: "Easy", color: "text-sky-400", bg: "bg-sky-500/15" },
  3: { label: "Intermediate", color: "text-amber-400", bg: "bg-amber-500/15" },
  4: { label: "Hard", color: "text-orange-400", bg: "bg-orange-500/15" },
  5: { label: "Expert", color: "text-red-400", bg: "bg-red-500/15" },
};

const diffMeta = (d: number) => DIFF_META[d] || DIFF_META[1];

// ── Course card gradients ──

const COURSE_GRADIENTS: Record<string, string> = {
  "python-fundamentals": "from-blue-600 via-blue-500 to-sky-400",
  "go-fundamentals": "from-cyan-600 via-cyan-500 to-teal-400",
  "python-intermediate": "from-violet-600 via-violet-500 to-purple-400",
  "data-structures": "from-amber-600 via-amber-500 to-yellow-400",
};
const DEFAULT_GRADIENT = "from-slate-600 via-slate-500 to-gray-400";

// ─────────────────────────────────────────────────
//  Course Card
// ─────────────────────────────────────────────────

interface AdminCourseCardProps {
  course: Course;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  children?: React.ReactNode;
}

export function AdminCourseCard({
  course, isSelected, isExpanded, onSelect, onEdit, onDelete,
  onToggleVisibility, children,
}: AdminCourseCardProps) {
  const [hovered, setHovered] = useState(false);
  const gradient = COURSE_GRADIENTS[course.slug] || DEFAULT_GRADIENT;
  const diff = diffMeta(course.difficulty_level ?? 1);

  return (
    <div>
      <div
        className={cn(
          "group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ease-out",
          "border border-border/60",
          "hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5",
          "hover:border-primary/30",
          isSelected && "ring-2 ring-primary/40 border-primary/30 shadow-lg shadow-primary/10 -translate-y-0.5",
        )}
        onClick={onSelect}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Shadow back plate — CodePen-inspired */}
        <div className={cn(
          "absolute -z-10 rounded-xl transition-all duration-300 ease-out",
          "bg-black/10 dark:bg-white/[0.06]",
          "left-2 top-2 -right-1.5 -bottom-1.5",
          "opacity-0 scale-[0.96] blur-[0.5px]",
          "group-hover:opacity-100 group-hover:scale-100 group-hover:-translate-y-1 group-hover:blur-0",
        )} />

        {/* Hero — show image_url if set, fallback to gradient */}
        <div
          className={cn("relative h-24 flex items-center justify-center overflow-hidden", course.image_url ? "" : `bg-gradient-to-br ${gradient}`)}
          style={course.image_url ? { backgroundImage: `url(${course.image_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        >
          {course.image_url && <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />}
          {!course.image_url && <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.12),transparent_60%)]" />}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent" />
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg",
            "bg-white/90 dark:bg-card/90 backdrop-blur-sm ring-1 ring-white/20",
            "transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-xl",
          )}>
            <BookOpen className="h-6 w-6 text-foreground" />
          </div>
          {!course.visible && (
            <Badge variant="secondary" className="absolute top-2.5 right-2.5 text-[10px] font-medium shadow-sm">
              Draft
            </Badge>
          )}
          {/* Visibility toggle — always visible */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
            className={cn(
              "absolute top-2.5 left-2.5 p-1.5 rounded-lg transition-all duration-200",
              course.visible
                ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                : "bg-white/20 text-white/70 hover:bg-white/30 hover:text-white",
            )}
            title={course.visible ? "Hide course" : "Publish course"}
          >
            {course.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Body */}
        <div className="p-3.5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate leading-tight">{course.title}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{course.slug}</p>
            </div>
            <div className="shrink-0 text-muted-foreground transition-colors duration-200">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
          </div>

          {/* Metadata row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold", diff.bg, diff.color)}>
              <span className={cn("w-1 h-1 rounded-full", diff.color.replace("text-", "bg-"))} />
              {diff.label}
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <Clock className="h-3 w-3" /> {course.estimated_hours ?? 0}h
            </span>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-end gap-1 px-3 pb-2.5 transition-opacity duration-200">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-1.5 rounded-lg bg-muted/60 hover:bg-primary/20 hover:text-primary transition-colors duration-150"
            title="Edit course"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 rounded-lg bg-muted/60 hover:bg-red-500/20 hover:text-red-400 transition-colors duration-150"
            title="Delete course"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Nested modules */}
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────
//  Module Card (sidebar item)
// ─────────────────────────────────────────────────

interface AdminModuleCardProps {
  mod: Module;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
}

export function AdminModuleCard({
  mod, isSelected, onSelect, onEdit, onDelete, onToggleVisibility,
}: AdminModuleCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={cn(
        "group relative flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all duration-200",
        "border border-transparent",
        isSelected
          ? "bg-primary/10 border-primary/20 text-primary shadow-sm"
          : "hover:bg-muted/40 hover:border-border/40 text-foreground/80",
      )}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Shadow back plate */}
      <div className={cn(
        "absolute -z-10 inset-0 rounded-lg transition-all duration-200",
        "opacity-0",
        !isSelected && "group-hover:opacity-100 group-hover:bg-black/[0.04] dark:group-hover:bg-white/[0.02]",
      )} />

      <div className="flex items-center gap-2.5 min-w-0 flex-1 relative">
        <div className={cn(
          "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors",
          isSelected ? "bg-primary/20 text-primary" : "bg-muted/60 text-muted-foreground",
        )}>
          <Layers className="h-3.5 w-3.5" />
        </div>
        <span className="truncate text-xs font-medium">{mod.title}</span>
        {!mod.visible && (
          <Badge variant="outline" className="text-[9px] px-1 py-0 border-red-300 text-red-500 dark:border-red-800 dark:text-red-400 shrink-0">Draft</Badge>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 shrink-0 ml-2 relative">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
          className={cn(
            "p-1 rounded-md transition-colors duration-150",
            mod.visible ? "text-emerald-400 hover:bg-emerald-500/15" : "text-muted-foreground hover:bg-muted/60",
          )}
          title={mod.visible ? "Hide module" : "Publish module"}
        >
          {mod.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="p-1 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors duration-150"
          title="Edit module"
        >
          <Edit3 className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 rounded-md hover:bg-red-500/15 text-muted-foreground hover:text-red-400 transition-colors duration-150"
          title="Delete module"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
//  Lesson Card
// ─────────────────────────────────────────────────

interface AdminLessonCardProps {
  lesson: Lesson;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
}

export function AdminLessonCard({
  lesson, isSelected, onSelect, onEdit, onDelete, onToggleVisibility,
}: AdminLessonCardProps) {
  const [hovered, setHovered] = useState(false);
  const diff = diffMeta(lesson.difficulty);

  return (
    <div
      className={cn(
        "group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ease-out",
        "border border-border/60",
        "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5",
        "hover:border-primary/20",
        isSelected && "ring-2 ring-primary/30 border-primary/25 shadow-md shadow-primary/8 -translate-y-0",
      )}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Shadow back plate — CodePen-inspired */}
      <div className={cn(
        "absolute -z-10 rounded-xl transition-all duration-300 ease-out",
        "bg-black/10 dark:bg-white/[0.06]",
        "left-1.5 top-1.5 -right-1 -bottom-1",
        "opacity-0 scale-[0.97] blur-[0.5px]",
        "group-hover:opacity-100 group-hover:scale-100 group-hover:-translate-y-0.5 group-hover:blur-0",
      )} />

      {/* Top accent stripe */}
      <div className={cn(
        "h-1 transition-all duration-300",
        isSelected ? "bg-gradient-to-r from-primary via-primary/80 to-primary/40" : "bg-gradient-to-r from-muted/40 via-muted/20 to-transparent",
        hovered && !isSelected && "bg-gradient-to-r from-primary/40 via-primary/20 to-transparent",
      )} />

      <div className="p-3.5 relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-center gap-2 mb-1.5">
              <GripVertical className={cn(
                "h-3.5 w-3.5 shrink-0 transition-colors duration-200",
                hovered ? "text-muted-foreground/60" : "text-muted-foreground/20",
              )} />
              <FileText className={cn(
                "h-3.5 w-3.5 shrink-0 transition-colors duration-200",
                isSelected ? "text-primary" : "text-muted-foreground/60",
              )} />
              <span className="font-medium text-sm truncate">{lesson.title}</span>
              {!lesson.visible && (
                <Badge variant="outline" className="text-[9px] px-1 py-0 border-red-300 text-red-500 dark:border-red-800 dark:text-red-400 shrink-0">Draft</Badge>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
                className={cn(
                  "shrink-0 p-0.5 rounded transition-colors duration-150",
                  lesson.visible ? "text-emerald-400" : "text-muted-foreground/40",
                )}
                title={lesson.visible ? "Hide lesson" : "Publish lesson"}
              >
                {lesson.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </button>
            </div>

            {lesson.description && (
              <p className="text-xs text-muted-foreground mb-2 pl-7 whitespace-pre-line">{lesson.description}</p>
            )}

            {/* Metadata badges */}
            <div className="flex items-center gap-2.5 flex-wrap pl-7">
              <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold", diff.bg, diff.color)}>
                {diff.label}
              </span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <Clock className="h-3 w-3" /> {lesson.estimated_minutes}min
              </span>
              <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                <Zap className="h-3 w-3" /> {lesson.xp_reward} XP
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-1 shrink-0 transition-opacity duration-200">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-1.5 rounded-lg bg-muted/60 hover:bg-primary/20 hover:text-primary transition-colors duration-150"
              title="Edit lesson"
            >
              <Edit3 className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 rounded-lg bg-muted/60 hover:bg-red-500/20 hover:text-red-400 transition-colors duration-150"
              title="Delete lesson"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
//  Project Card
// ─────────────────────────────────────────────────

interface AdminProjectCardProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
}

export function AdminProjectCard({
  project, onEdit, onDelete, onToggleVisibility,
}: AdminProjectCardProps) {
  const [hovered, setHovered] = useState(false);
  const diff = diffMeta(project.difficulty);

  return (
    <div
      className={cn(
        "group relative rounded-xl overflow-hidden transition-all duration-300 ease-out",
        "border border-border/60",
        "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5",
        "hover:border-primary/20",
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Shadow back plate */}
      <div className={cn(
        "absolute -z-10 rounded-xl transition-all duration-300 ease-out",
        "bg-black/10 dark:bg-white/[0.06]",
        "left-1.5 top-1.5 -right-1 -bottom-1",
        "opacity-0 scale-[0.97] blur-[0.5px]",
        "group-hover:opacity-100 group-hover:scale-100 group-hover:-translate-y-0.5 group-hover:blur-0",
      )} />

      {/* Top accent stripe */}
      <div className="h-0.5 bg-gradient-to-r from-violet-500/40 via-violet-500/20 to-transparent" />

      <div className="p-3 relative">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Beaker className="h-3.5 w-3.5 text-violet-400/60 shrink-0" />
              <p className="text-sm font-medium truncate">{project.title}</p>
              {!project.visible && (
                <Badge variant="outline" className="text-[9px] px-1 py-0 border-red-300 text-red-500 dark:border-red-800 dark:text-red-400 shrink-0">Draft</Badge>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
                className={cn(
                  "shrink-0 p-0.5 rounded transition-colors duration-150",
                  project.visible ? "text-emerald-400" : "text-muted-foreground/40",
                )}
                title={project.visible ? "Hide project" : "Publish project"}
              >
                {project.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground truncate pl-5.5">{project.slug}</p>
            <div className="flex items-center gap-2.5 mt-1.5 pl-5.5">
              <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold", diff.bg, diff.color)}>
                {diff.label}
              </span>
              <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                <Zap className="h-3 w-3" /> {project.xp_reward} XP
              </span>
            </div>
          </div>

          <div className="flex gap-1 shrink-0 transition-opacity duration-200">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-1.5 rounded-lg bg-muted/60 hover:bg-primary/20 hover:text-primary transition-colors duration-150"
              title="Edit project"
            >
              <Edit3 className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 rounded-lg bg-muted/60 hover:bg-red-500/20 hover:text-red-400 transition-colors duration-150"
              title="Delete project"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
