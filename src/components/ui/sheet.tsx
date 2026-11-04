"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;

function SheetContent({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return <DialogPrimitive.Portal><DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/65"/><DialogPrimitive.Content className={cn("fixed inset-y-0 left-0 z-50 flex w-[min(85vw,280px)] flex-col border-r border-[var(--border)] bg-[var(--sidebar)] p-5 text-[var(--text)] shadow-2xl outline-none",className)} {...props}><DialogPrimitive.Title className="sr-only">Navigation</DialogPrimitive.Title><DialogPrimitive.Description className="sr-only">Choose a page</DialogPrimitive.Description><DialogPrimitive.Close className="absolute right-4 top-4 rounded-md p-2 text-[var(--muted)] hover:bg-[var(--field)]" aria-label="Close navigation"><X size={18}/></DialogPrimitive.Close>{children}</DialogPrimitive.Content></DialogPrimitive.Portal>;
}

export { Sheet, SheetContent };
