import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    (<textarea
      className={cn(
        "flex min-h-[96px] w-full rounded-lg border border-input/80 bg-background/80 px-3 py-2 text-base shadow-sm shadow-foreground/[0.02] transition-[border-color,box-shadow,background-color] placeholder:text-muted-foreground/75 hover:border-primary/35 focus-visible:border-primary/55 focus-visible:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Textarea.displayName = "Textarea"

export { Textarea }
