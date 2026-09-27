"use client";

import { useEffect } from "react";
import AOS from "aos";

export function AOSInit() {
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      AOS.init({ duration: 600, easing: "ease-out-cubic", once: true, offset: 80, delay: 0, disable: false });
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return null;
}
