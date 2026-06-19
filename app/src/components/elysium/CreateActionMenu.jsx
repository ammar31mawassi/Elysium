import React from "react";
import { BookOpenCheck, ClipboardList, FileQuestion, Plus, Trophy, Users } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { createActionCopy } from "@/lib/createActions";
import { useCreateAction } from "@/components/elysium/CreateActionProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { domainTones } from "@/lib/domainTones";

export const createActionIcons = {
  social: Users,
  study: BookOpenCheck,
  homework: ClipboardList,
  exam: Trophy,
  other: FileQuestion,
};

export default function CreateActionMenu({ className, compact = false, label, iconOnly = false, variant = "featured" }) {
  const { locale, t } = useLanguage();
  const { openCreateAction } = useCreateAction();
  const menu = createActionCopy(locale);
  const isFeatured = variant === "featured";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          data-tour="create-action"
          data-tour-surface="desktop"
          className={cn(
            "flex items-center gap-2 rounded-md px-3 text-sm font-semibold",
            isFeatured ? "featured-surface featured-action h-11" : "border border-border bg-card text-foreground hover:border-primary/40",
            className,
          )}
          aria-label={label || menu.title}
        >
          <Plus className={cn("h-4 w-4", !isFeatured && "text-primary")} />
          {!iconOnly && (label || (compact ? t("nav_add") : menu.title))}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-2">
        <DropdownMenuLabel className="px-2 pb-2 text-xs text-muted-foreground">{menu.title}</DropdownMenuLabel>
        {menu.actions.map((action) => {
          const Icon = createActionIcons[action.key];
          return (
            <DropdownMenuItem key={action.key} onSelect={() => openCreateAction(action.key)} className="min-h-14 cursor-pointer items-start rounded-md p-2.5">
              <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md", action.key === "social" ? domainTones.social.icon : action.key === "study" ? domainTones.study.icon : domainTones.calendar.icon)}><Icon className="h-4 w-4" /></span>
              <span className="min-w-0"><span className="block text-sm font-semibold text-foreground">{action.label}</span><span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{action.description}</span></span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
