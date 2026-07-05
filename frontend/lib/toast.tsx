import { toast as sonnerToast } from "sonner";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";

type ToastOptions = {
  title: string;
  description?: string;
  duration?: number;
};

const COLORS = {
  success: {
    icon: "text-brand-success",
    bg: "bg-brand-success/10",
    border: "border-brand-success/20",
  },
  error: {
    icon: "text-brand-error",
    bg: "bg-brand-error/10",
    border: "border-brand-error/20",
  },
  info: {
    icon: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
  },
  warning: {
    icon: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
  },
};

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

function createToast(type: "success" | "error" | "info" | "warning", options: ToastOptions | string) {
  const title = typeof options === "string" ? options : options.title;
  const description = typeof options === "string" ? undefined : options.description;
  const duration = typeof options === "string" ? 2000 : (options.duration ?? 2000);
  const Icon = ICONS[type];
  const c = COLORS[type];

  sonnerToast.custom(
    (id) => (
      <div
        style={{ animation: "slideInFromRight 0.35s ease-out" }}
        className="pointer-events-auto w-full max-w-sm"
      >
        <div className={`${c.bg} ${c.border} border bg-brand-charcoal-card rounded-xl shadow-2xl shadow-black/40 backdrop-blur-sm overflow-hidden`}>
          <div className="flex items-start gap-3 p-4">
            <div className={`${c.bg} p-1.5 rounded-lg shrink-0`}>
              <Icon size={18} className={c.icon} />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm font-bold text-brand-offwhite leading-snug">{title}</p>
              {description && (
                <p className="text-xs text-brand-offwhite-muted mt-1 leading-relaxed">{description}</p>
              )}
            </div>
            <button
              onClick={() => sonnerToast.dismiss(id)}
              className="text-brand-offwhite-muted hover:text-brand-offwhite transition-colors shrink-0 p-0.5 -mr-1 -mt-1"
            >
              <X size={15} />
            </button>
          </div>
          <div className={`h-0.5 w-full ${c.bg} animate-toast-progress`} style={{ animationDuration: `${duration}ms` }} />
        </div>
      </div>
    ),
    { duration, id: title }
  );
}

export const toast = {
  success: (options: ToastOptions | string) => createToast("success", options),
  error: (options: ToastOptions | string) => createToast("error", options),
  info: (options: ToastOptions | string) => createToast("info", options),
  warning: (options: ToastOptions | string) => createToast("warning", options),
};
