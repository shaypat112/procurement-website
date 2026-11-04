"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;

function DialogContent({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return <DialogPrimitive.Portal><DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm" /><DialogPrimitive.Content className={cn("fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[470px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 text-[var(--text)] shadow-2xl outline-none md:p-6", className)} {...props}>{children}<DialogPrimitive.Close className="absolute right-5 top-5 rounded-md p-1.5 text-[var(--muted)] hover:bg-[var(--field)] hover:text-[var(--text)]" aria-label="Close dialog"><X size={16}/></DialogPrimitive.Close></DialogPrimitive.Content></DialogPrimitive.Portal>;
}

export { Dialog, DialogContent, DialogTitle, DialogDescription };
