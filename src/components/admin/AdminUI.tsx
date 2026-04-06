"use client";

import type { LucideIcon } from "lucide-react";
import { Search } from "lucide-react";
import { Button, cn } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormElements";

type Tone = "slate" | "blue" | "emerald" | "amber" | "red";

const toneStyles: Record<Tone, { icon: string; chip: string }> = {
  slate: {
    icon: "border-slate-200 bg-slate-100 text-slate-700",
    chip: "border-slate-300 bg-slate-100 text-slate-700",
  },
  blue: {
    icon: "border-blue-200 bg-blue-50 text-blue-700",
    chip: "border-blue-200 bg-blue-50 text-blue-700",
  },
  emerald: {
    icon: "border-emerald-200 bg-emerald-50 text-emerald-700",
    chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  amber: {
    icon: "border-amber-200 bg-amber-50 text-amber-700",
    chip: "border-amber-200 bg-amber-50 text-amber-700",
  },
  red: {
    icon: "border-red-200 bg-red-50 text-red-700",
    chip: "border-red-200 bg-red-50 text-red-700",
  },
};

export function AdminPage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("admin-page", className)}>{children}</div>;
}

export function AdminHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="admin-page-header">
      <div className="min-w-0 space-y-1">
        <h1 className="admin-page-title">{title}</h1>
        {subtitle ? <p className="admin-page-subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="admin-toolbar">{actions}</div> : null}
    </div>
  );
}

export function AdminSearch({
  placeholder,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("admin-search", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input {...props} className="pl-9" placeholder={placeholder} />
    </div>
  );
}

export function AdminPrimaryButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      {...props}
      className={cn(
        "h-10 rounded-lg border-slate-900 bg-slate-900 px-4 text-sm font-medium tracking-normal text-white hover:bg-slate-800 hover:text-white",
        className,
      )}
    >
      {children}
    </Button>
  );
}

export function AdminSecondaryButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      {...props}
      variant="secondary"
      className={cn(
        "h-10 rounded-lg border-slate-300 px-4 text-sm font-medium tracking-normal text-slate-700 hover:bg-slate-50",
        className,
      )}
    >
      {children}
    </Button>
  );
}

export function AdminStatGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("admin-stat-grid", className)}>{children}</div>;
}

export function AdminStatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "slate",
}: {
  label: string;
  value: React.ReactNode;
  detail?: string;
  icon: LucideIcon;
  tone?: Tone;
}) {
  return (
    <div className="admin-stat-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="admin-stat-label">{label}</p>
          <div className="admin-stat-value">{value}</div>
          {detail ? <p className="admin-stat-detail">{detail}</p> : null}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
            toneStyles[tone].icon,
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export function AdminPanel({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("admin-panel", className)}>
      {title || subtitle || action ? (
        <div className="admin-panel-header">
          <div className="min-w-0 space-y-1">
            {title ? <h2 className="admin-panel-title">{title}</h2> : null}
            {subtitle ? <p className="admin-panel-subtitle">{subtitle}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function AdminStatusChip({
  label,
  tone = "slate",
  className,
}: {
  label: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium",
        toneStyles[tone].chip,
        className,
      )}
    >
      {label}
    </span>
  );
}

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="admin-empty-state">
      <div className="admin-empty-icon">
        <Icon className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <div className="admin-empty-title">{title}</div>
        {description ? <p className="admin-empty-description">{description}</p> : null}
      </div>
    </div>
  );
}
