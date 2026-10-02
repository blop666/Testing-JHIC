"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ComponentProps,
  type HTMLAttributes,
  type MouseEventHandler,
} from "react";
import Image from "next/image";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export const cutoutCardSurfaceShadowClassName = cn(
  "border border-white/15",
  "shadow-[0_14px_40px_-24px_rgba(2,19,31,0.65)]",
  "transition-[box-shadow,border-color,transform] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
  "hover:border-cyan-300/25 hover:shadow-[0_18px_42px_-30px_rgba(6,182,212,0.3)]",
);

export const cutoutCardSurfaceClassName = cn(
  "group/cutout relative cursor-pointer overflow-hidden rounded-[28px] bg-white text-slate-950",
  cutoutCardSurfaceShadowClassName,
);

export function useCutoutContentStaggerVariants() {
  const reduceMotion = useReducedMotion();

  return useMemo(() => {
    if (reduceMotion) {
      return {
        container: {
          hidden: {},
          show: { transition: { staggerChildren: 0.03, delayChildren: 0 } },
        },
        item: {
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] },
          },
        },
      } as const;
    }

    return {
      container: {
        hidden: {},
        show: { transition: { staggerChildren: 0.055, delayChildren: 0.06 } },
      },
      item: {
        hidden: { opacity: 0, y: 12, filter: "blur(5px)" },
        show: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { type: "spring", duration: 0.48, bounce: 0.14 },
        },
      },
    } as const;
  }, [reduceMotion]);
}

const CORNER_PATH = "M0 200C155.996 199.961 200.029 156.308 200 0V200H0Z";

export interface CutoutCardContextValue {
  hovered: boolean;
  setHovered: (next: boolean) => void;
}

const CutoutCardContext = createContext<CutoutCardContextValue | null>(null);

export function useCutoutCard() {
  const context = useContext(CutoutCardContext);
  if (!context) {
    throw new Error("useCutoutCard must be used within <CutoutCard>");
  }
  return context;
}

export function useOptionalCutoutCard() {
  return useContext(CutoutCardContext);
}

export type CutoutCardProps = Omit<
  ComponentProps<typeof motion.div>,
  "defaultValue"
> & {
  hovered?: boolean;
  defaultHovered?: boolean;
  onHoveredChange?: (hovered: boolean) => void;
  trackPointerHover?: boolean;
};

export function CutoutCard({
  className,
  hovered: hoveredProp,
  defaultHovered = false,
  onHoveredChange,
  trackPointerHover = true,
  onMouseEnter,
  onMouseLeave,
  children,
  ...props
}: CutoutCardProps) {
  const [hovered, setHovered] = useControllableState({
    prop: hoveredProp,
    defaultProp: defaultHovered,
    onChange: onHoveredChange,
  });

  const setHoveredStable = useCallback(
    (next: boolean) => setHovered(next),
    [setHovered],
  );

  const context = useMemo<CutoutCardContextValue>(
    () => ({ hovered: hovered ?? false, setHovered: setHoveredStable }),
    [hovered, setHoveredStable],
  );

  const handleMouseEnter: MouseEventHandler<HTMLDivElement> = (event) => {
    onMouseEnter?.(event);
    if (!event.defaultPrevented && trackPointerHover) setHoveredStable(true);
  };

  const handleMouseLeave: MouseEventHandler<HTMLDivElement> = (event) => {
    onMouseLeave?.(event);
    if (!event.defaultPrevented && trackPointerHover) setHoveredStable(false);
  };

  return (
    <CutoutCardContext.Provider value={context}>
      <motion.div
        className={cn(className)}
        data-slot="cutout-card"
        data-state={context.hovered ? "hovered" : "idle"}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </motion.div>
    </CutoutCardContext.Provider>
  );
}

export type CutoutCardMediaProps = HTMLAttributes<HTMLDivElement>;

export function CutoutCardMedia({ className, ...props }: CutoutCardMediaProps) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      data-slot="cutout-card-media"
      {...props}
    />
  );
}

export type CutoutCardImageProps = ComponentProps<typeof Image>;

export function CutoutCardImage({
  className,
  alt = "",
  fill = true,
  loading = "lazy",
  decoding = "async",
  quality = 55,
  sizes = "(max-width: 768px) 100vw, 28rem",
  ...props
}: CutoutCardImageProps) {
  return (
    <Image
      alt={alt}
      className={cn(
        "object-cover transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/cutout:scale-105",
        fill && "h-full w-full",
        className,
      )}
      data-slot="cutout-card-image"
      {...props}
      fill={fill}
      loading={loading}
      decoding={decoding}
      quality={quality}
      sizes={fill ? sizes : undefined}
    />
  );
}

export type CutoutCardOverlayProps = HTMLAttributes<HTMLDivElement>;

export function CutoutCardOverlay({
  className,
  ...props
}: CutoutCardOverlayProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/35 to-transparent",
        className,
      )}
      data-slot="cutout-card-overlay"
      {...props}
    />
  );
}

export type CutoutCardContentProps = HTMLAttributes<HTMLDivElement>;

export function CutoutCardContent({
  className,
  ...props
}: CutoutCardContentProps) {
  return (
    <div
      className={cn("p-6", className)}
      data-slot="cutout-card-content"
      {...props}
    />
  );
}

export type CutoutCardFooterProps = HTMLAttributes<HTMLDivElement>;

export function CutoutCardFooter({
  className,
  ...props
}: CutoutCardFooterProps) {
  return (
    <div
      className={cn("flex items-center justify-between", className)}
      data-slot="cutout-card-footer"
      {...props}
    />
  );
}

export type CutoutCornerProps = ComponentProps<"svg"> & {
  size?: number;
};

export function CutoutCorner({
  className,
  size = 32,
  viewBox = "0 0 200 200",
  ...props
}: CutoutCornerProps) {
  return (
    <svg
      aria-hidden
      className={cn(className)}
      data-slot="cutout-corner"
      height={size}
      viewBox={viewBox}
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d={CORNER_PATH} fill="currentColor" />
    </svg>
  );
}

export type CutoutCardInsetLabelProps = HTMLAttributes<HTMLDivElement>;

export function CutoutCardInsetLabel({
  className,
  ...props
}: CutoutCardInsetLabelProps) {
  return (
    <div
      className={cn("absolute", className)}
      data-slot="cutout-card-inset-label"
      {...props}
    />
  );
}

export type CutoutCardPinProps = HTMLAttributes<HTMLDivElement>;

export function CutoutCardPin({ className, ...props }: CutoutCardPinProps) {
  return (
    <div
      className={cn("absolute", className)}
      data-slot="cutout-card-pin"
      {...props}
    />
  );
}

export type CutoutCardActionProps = ComponentProps<typeof motion.div> & {
  revealOnHover?: boolean;
};

export function CutoutCardAction({
  className,
  revealOnHover = true,
  ...props
}: CutoutCardActionProps) {
  const { hovered } = useCutoutCard();
  const reduceMotion = useReducedMotion();
  const visible = !revealOnHover || hovered;

  return (
    <motion.div
      animate={
        visible
          ? { opacity: 1, transform: "translateY(0px)" }
          : { opacity: 0, transform: "translateY(8px)" }
      }
      className={cn(
        "absolute",
        revealOnHover && !visible && "pointer-events-none",
        className,
      )}
      data-reveal={revealOnHover ? "hover" : "always"}
      data-slot="cutout-card-action"
      transition={
        reduceMotion
          ? { duration: 0.15, ease: [0.23, 1, 0.32, 1] }
          : { duration: 0.24, ease: [0.23, 1, 0.32, 1] }
      }
      {...props}
    />
  );
}
