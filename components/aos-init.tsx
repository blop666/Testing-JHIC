"use client";

import { useEffect } from "react";

export function AOSInit() {
  useEffect(() => {
    if (!document.querySelector("[data-aos]")) return;

    let disposed = false;
    import("aos").then(({ default: AOS }) => {
      if (disposed) return;
      // @ts-expect-error — CSS side-effect import, resolved by Next bundler.
      import("aos/dist/aos.css");
      AOS.init({ duration: 600, easing: "ease-out-cubic", once: true, offset: 80, delay: 0 });
    });

    return () => {
      disposed = true;
    };
  }, []);

  return null;
}
