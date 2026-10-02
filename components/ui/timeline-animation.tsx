"use client";

import type { Variants } from "framer-motion";
import { type HTMLMotionProps, motion, useInView } from "framer-motion";
import type React from "react";

type TimelineAnimationProps<T extends keyof HTMLElementTagNameMap> = {
  children?: React.ReactNode;
  animationNum: number;
  className?: string;
  timelineRef: React.RefObject<HTMLElement | null>;
  as?: T;
  customVariants?: Variants;
  once?: boolean;
} & HTMLMotionProps<T>;

export function TimelineAnimation<T extends keyof HTMLElementTagNameMap = "div">({
  children,
  animationNum,
  timelineRef,
  className,
  as,
  customVariants,
  once = true,
  ...props
}: TimelineAnimationProps<T>) {
  const defaultSequenceVariants: Variants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.12,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
    hidden: {
      y: 20,
      opacity: 0,
    },
  };

  const isInView = useInView(timelineRef, { once, margin: "0px 0px -25% 0px" });
  const MotionComponent = motion[as || "div"] as React.ElementType;

  return (
    <MotionComponent
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      custom={animationNum}
      variants={customVariants || defaultSequenceVariants}
      className={className}
      {...props}
    >
      {children}
    </MotionComponent>
  );
}
