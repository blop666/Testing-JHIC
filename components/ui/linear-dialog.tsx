"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  type Transition,
  type Variant,
} from "framer-motion";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface DialogContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  uniqueId: string;
  triggerRef: RefObject<HTMLDivElement | null>;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialog() {
  const context = useContext(DialogContext);
  if (!context) throw new Error("Dialog components must be used within <Dialog>");
  return context;
}

interface DialogProps {
  children: ReactNode;
  open?: boolean;
  transition?: Transition;
  onOpenChange?: (open: boolean) => void;
}

export function Dialog({ children, open: controlledOpen, transition, onOpenChange }: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpen = controlledOpen ?? uncontrolledOpen;
  const uniqueId = useId();
  const triggerRef = useRef<HTMLDivElement>(null);
  const updateOpen = useCallback(
    (open: boolean) => {
      if (controlledOpen === undefined) setUncontrolledOpen(open);
      onOpenChange?.(open);
    },
    [controlledOpen, onOpenChange],
  );
  const value = useMemo(
    () => ({ isOpen, setIsOpen: updateOpen, uniqueId, triggerRef }),
    [isOpen, uniqueId, updateOpen],
  );

  return (
    <DialogContext.Provider value={value}>
      <MotionConfig transition={transition}>{children}</MotionConfig>
    </DialogContext.Provider>
  );
}

interface DialogTriggerProps {
  children: ReactNode;
  className?: string;
  onActivate?: () => void;
  style?: CSSProperties;
}

export function DialogTrigger({ children, className, onActivate, style }: DialogTriggerProps) {
  const { isOpen, setIsOpen, uniqueId, triggerRef } = useDialog();

  const openDialog = useCallback(() => {
    onActivate?.();
    setIsOpen(true);
  }, [onActivate, setIsOpen]);

  return (
    <motion.div
      aria-controls={`dialog-content-${uniqueId}`}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      className={cn("relative cursor-pointer", className)}
      onClick={openDialog}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDialog();
        }
      }}
      ref={triggerRef}
      role="button"
      style={style}
      tabIndex={0}
    >
      {children}
    </motion.div>
  );
}

interface DialogContainerProps {
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
}

export function DialogContainer({
  children,
  className,
  overlayClassName,
}: DialogContainerProps) {
  const { isOpen, setIsOpen, uniqueId } = useDialog();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence initial={false}>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.button
            aria-label="Tutup detail berita"
            className={cn(
              "absolute inset-0 h-full w-full cursor-default bg-slate-950/55",
              overlayClassName,
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            transition={{ duration: 0.32 }}
            type="button"
          />
          <div className={cn("pointer-events-none absolute inset-0 grid place-items-center p-3 sm:p-6", className)}>
            {children}
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

interface DialogContentProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function DialogContent({ children, className, style }: DialogContentProps) {
  const { isOpen, setIsOpen, uniqueId, triggerRef } = useDialog();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const container = containerRef.current;
    const focusable = container?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable?.[0];
    const last = focusable?.[focusable.length - 1];
    requestAnimationFrame(() => first?.focus());

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
      if (event.key !== "Tab" || !first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [isOpen, setIsOpen, triggerRef]);

  return (
    <motion.div
      animate={{ opacity: 1, scale: 1, y: 0 }}
      aria-describedby={`dialog-description-${uniqueId}`}
      aria-labelledby={`dialog-title-${uniqueId}`}
      aria-modal="true"
      className={cn("pointer-events-auto overflow-hidden", className)}
      exit={{ opacity: 0, scale: 0.96, y: 8 }}
      id={`dialog-content-${uniqueId}`}
      initial={{ opacity: 0, scale: 0.92, y: 24 }}
      ref={containerRef}
      role="dialog"
      style={{ ...style, willChange: "transform, opacity" }}
      transition={{ type: "spring", damping: 26, stiffness: 320, mass: 0.9 }}
    >
      {children}
    </motion.div>
  );
}

interface DialogTextProps {
  children: ReactNode;
  className?: string;
  variants?: { initial: Variant; animate: Variant; exit: Variant };
}

export function DialogTitle({ children, className }: DialogTextProps) {
  const { uniqueId } = useDialog();
  return <h2 className={className} id={`dialog-title-${uniqueId}`}>{children}</h2>;
}

export function DialogDescription({ children, className }: DialogTextProps) {
  const { uniqueId } = useDialog();
  return <div className={className} id={`dialog-description-${uniqueId}`}>{children}</div>;
}

interface DialogCloseProps {
  children?: ReactNode;
  className?: string;
}

export function DialogClose({ children, className }: DialogCloseProps) {
  const { setIsOpen } = useDialog();
  return (
    <button
      aria-label="Tutup dialog"
      className={cn("absolute right-5 top-5", className)}
      onClick={() => setIsOpen(false)}
      type="button"
    >
      {children ?? <XIcon className="h-5 w-5" />}
    </button>
  );
}
