"use client";

import { AnimatePresence, type HTMLMotionProps, motion } from "framer-motion";
import { createContext, type ButtonHTMLAttributes, type ReactNode, useContext, useState } from "react";

import { cn } from "@/lib/utils";

const ExpandableContext = createContext<{ isExpanded: boolean; toggle: () => void } | null>(null);

function useExpandable() {
  const context = useContext(ExpandableContext);
  if (!context) throw new Error("Expandable components must be used within <Expandable>");
  return context;
}

export function Expandable({ children }: { children: ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false);
  return <ExpandableContext.Provider value={{ isExpanded, toggle: () => setIsExpanded((value) => !value) }}>{children}</ExpandableContext.Provider>;
}

export function ExpandableCard({ className, ...props }: HTMLMotionProps<"article">) {
  const { isExpanded } = useExpandable();
  return <motion.article layout className={cn("overflow-hidden", className)} transition={{ type: "spring", stiffness: 200, damping: 24 }} {...props} data-expanded={isExpanded} />;
}

export function ExpandableTrigger({ className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { isExpanded, toggle } = useExpandable();
  return <button type="button" aria-expanded={isExpanded} onClick={toggle} className={cn("text-left", className)} {...props}>{children}</button>;
}

export function ExpandableContent({ className, children }: { className?: string; children: ReactNode }) {
  const { isExpanded } = useExpandable();
  return (
    <AnimatePresence initial={false}>
      {isExpanded && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
          <div className={className}>{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
