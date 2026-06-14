import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpenCheck, ClipboardList, FileQuestion, Plus, Trophy, Users } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { createActionCopy } from "@/lib/createActions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const createActionIcons = {
  social: Users,
  study: BookOpenCheck,
  homework: ClipboardList,
  exam: Trophy,
  other: FileQuestion,
};

export default function CreateActionMenu({ className, compact = false, label, iconOnly = false }) {
  const navigate = useNavigate();
  const { locale, t } = useLanguage();
  const menu = createActionCopy(locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn("featured-surface featured-action flex h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold", className)} aria-label={label || menu.title}>
          <Plus className="h-4 w-4" />
          {!iconOnly && (label || (compact ? t("nav_add") : menu.title))}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-2">
        <DropdownMenuLabel className="px-2 pb-2 text-xs text-muted-foreground">{menu.title}</DropdownMenuLabel>
        {menu.actions.map((action) => {
          const Icon = createActionIcons[action.key];
          return (
            <DropdownMenuItem key={action.key} onSelect={() => navigate(action.path)} className="min-h-14 cursor-pointer items-start rounded-md p-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
              <span className="min-w-0"><span className="block text-sm font-semibold text-foreground">{action.label}</span><span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{action.description}</span></span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
