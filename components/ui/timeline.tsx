"use client";

import {
  useMotionValueEvent,
  useScroll,
  useTransform,
  motion,
} from "framer-motion";
import React, { useLayoutEffect, useRef, useState } from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateHeight = () => setHeight(element.getBoundingClientRect().height);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className="w-full font-sans md:px-10"
      ref={containerRef}
      style={{ backgroundColor: '#1b4d96' }}
    >
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-24 md:px-8 md:pt-32 lg:px-10">
        <h2 className="text-3xl md:text-5xl lg:text-6xl mb-6 text-white font-bold tracking-tight">
          Perjalanan SMKN 1 Cibinong
        </h2>
        <p className="text-white/80 text-base md:text-lg max-w-2xl">
          Dari awal berdiri hingga menjadi SMK terkemuka di Jawa Barat, ini adalah perjalanan kami dalam mengabdi untuk pendidikan Indonesia.
        </p>
      </div>

      <div ref={ref} className="relative mx-auto max-w-7xl pb-32">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-10 md:gap-10 md:pt-40"
          >
            <div className="sticky top-40 z-20 flex max-w-xs self-start items-center md:w-full md:flex-row lg:max-w-sm">
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-white border-2 border-blue-300" />
              </div>
              <h3 className="hidden md:block text-xl md:pl-20 md:text-4xl lg:text-5xl font-bold text-white">
                {item.title}
              </h3>
            </div>

            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-white">
                {item.title}
              </h3>
              {item.content}
            </div>
          </div>
        ))}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute left-8 top-0 w-[2px] overflow-hidden bg-gradient-to-b from-transparent via-white/30 to-transparent [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] md:left-8"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-cyan-400 via-blue-400 to-white rounded-full"
          />
        </div>
      </div>
    </div>
  );
};
