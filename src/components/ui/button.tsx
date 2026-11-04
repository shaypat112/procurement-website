import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-xs font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--muted)]", {
  variants: {
    variant: {
      default: "bg-[var(--accent)] text-[var(--accent-foreground)] hover:opacity-85",
      outline: "border border-[var(--border)] bg-transparent text-[var(--text)] hover:bg-[var(--field)]",
      ghost: "text-[var(--muted)] hover:bg-[var(--field)] hover:text-[var(--text)]",
      link: "text-[var(--muted)] underline-offset-4 hover:text-[var(--text)] hover:underline"
    },
    size: { default: "h-9 px-4 py-2", sm: "h-8 px-3", icon: "size-9" }
  },
  defaultVariants: { variant: "default", size: "default" }
});

function Button({ className, variant, size, ...props }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return <button data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
