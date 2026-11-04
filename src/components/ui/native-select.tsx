import * as React from "react";
import { cn } from "@/lib/utils";

function NativeSelect({ className, children, ...props }: React.ComponentProps<"select">) {
  return <select data-slot="native-select" className={cn("field cursor-pointer", className)} {...props}>{children}</select>;
}

export { NativeSelect };
