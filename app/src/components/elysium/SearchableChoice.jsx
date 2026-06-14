import React, { useEffect, useId, useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

function normalize(value = "") {
  return value.trim().toLocaleLowerCase("en").replace(/\s+/g, " ");
}

export default function SearchableChoice({
  value,
  onChange,
  options,
  placeholder,
  emptyLabel = "No matching options",
  allowCustom = false,
  customLabel = (query) => `Use "${query}"`,
}) {
  const listboxId = useId();
  const selected = options.find((option) => option.value === value);
  const selectedLabel = selected?.label || value || "";
  const [query, setQuery] = useState(selectedLabel);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(selectedLabel);
  }, [selectedLabel]);

  const filtered = useMemo(() => {
    const needle = normalize(query);
    if (!needle || (value && normalize(query) === normalize(selectedLabel))) return options.slice(0, 12);
    return options.filter((option) => normalize([option.label, option.value, ...(option.keywords || [])].join(" ")).includes(needle)).slice(0, 12);
  }, [options, query, selectedLabel, value]);

  const customValue = query.trim();
  const hasExactMatch = options.some((option) => normalize(option.value) === normalize(customValue) || normalize(option.label) === normalize(customValue));

  const choose = (option) => {
    onChange(option);
    setQuery(option.label);
    setOpen(false);
  };

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute start-3 top-[22px] z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        className="h-11 ps-9"
        value={query}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 100)}
        onChange={(event) => {
          setQuery(event.target.value);
          onChange(null);
          setOpen(true);
        }}
      />
      {open && (
        <div id={listboxId} role="listbox" className="absolute z-40 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-xl">
          {filtered.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(option)}
              className="flex min-h-11 w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-start text-sm text-popover-foreground hover:bg-muted"
            >
              <span className="min-w-0 truncate">{option.label}</span>
              {option.value === value && <Check className="h-4 w-4 shrink-0 text-primary" />}
            </button>
          ))}
          {allowCustom && customValue && !hasExactMatch && (
            <button
              type="button"
              role="option"
              aria-selected={false}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose({ value: customValue, label: customValue, custom: true })}
              className="flex min-h-11 w-full items-center rounded-md px-3 py-2 text-start text-sm font-semibold text-primary hover:bg-primary/10"
            >
              {customLabel(customValue)}
            </button>
          )}
          {!filtered.length && (!allowCustom || !customValue || hasExactMatch) && <p className="px-3 py-4 text-sm text-muted-foreground">{emptyLabel}</p>}
        </div>
      )}
    </div>
  );
}
