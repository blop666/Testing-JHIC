"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./logo-loop.css";

export type LogoItem =
  | { node: React.ReactNode; href?: string; title?: string; ariaLabel?: string }
  | { src: string; alt?: string; href?: string; title?: string; srcSet?: string; sizes?: string; width?: number; height?: number };

export interface LogoLoopProps {
  logos: LogoItem[];
  speed?: number;
  direction?: "left" | "right";
  width?: number | string;
  logoHeight?: number;
  gap?: number;
  pauseOnHover?: boolean;
  hoverSpeed?: number;
  fadeOut?: boolean;
  fadeOutColor?: string;
  scaleOnHover?: boolean;
  renderItem?: (item: LogoItem, key: React.Key) => React.ReactNode;
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function LogoLoop({ logos, speed = 60, direction = "left", width = "100%", logoHeight = 28, gap = 32, fadeOut = false, fadeOutColor, scaleOnHover = false, renderItem, ariaLabel = "Logo mitra", className, style }: LogoLoopProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLUListElement>(null);
  const [copies, setCopies] = useState(2);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure || !logos.length) return;
    const compute = () => {
      const containerWidth = container.clientWidth;
      const setWidth = measure.scrollWidth;
      if (!containerWidth || !setWidth) return;
      // Each half of the track must exceed the container width so the -50%
      // loop never shows a gap. Minimum 2 sets per half.
      const perHalf = Math.max(2, Math.ceil(containerWidth / setWidth) * 2);
      setCopies(perHalf * 2);
    };
    compute();
    const observer = new ResizeObserver(compute);
    observer.observe(container);
    window.addEventListener("resize", compute);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [logos]);

  const renderLogo = (item: LogoItem, key: React.Key) => {
    if (renderItem) return <li className="logoloop__item" key={key}>{renderItem(item, key)}</li>;
    const isNode = "node" in item;
    const content = isNode
      ? <span className="logoloop__node" aria-hidden={Boolean(item.href && !item.ariaLabel)}>{item.node}</span>
      : <img src={item.src} srcSet={item.srcSet} sizes={item.sizes} width={item.width} height={item.height} alt={item.alt ?? ""} title={item.title} loading="lazy" decoding="async" draggable={false} />;
    const label = isNode ? item.ariaLabel ?? item.title : item.alt ?? item.title;
    return <li className="logoloop__item" key={key}>{item.href ? <a className="logoloop__link" href={item.href} aria-label={label || "Tautan mitra"} target="_blank" rel="noreferrer noopener">{content}</a> : content}</li>;
  };

  const rootClassName = ["logoloop", direction === "right" && "logoloop--right", fadeOut && "logoloop--fade", scaleOnHover && "logoloop--scale-hover", className].filter(Boolean).join(" ");
  const containerStyle = {
    width: typeof width === "number" ? `${width}px` : width,
    "--logoloop-gap": `${gap}px`,
    "--logoloop-logoHeight": `${logoHeight}px`,
    "--logoloop-duration": `${Math.max(18, 2400 / Math.max(Math.abs(speed), 1))}s`,
    ...(fadeOutColor && { "--logoloop-fadeColor": fadeOutColor }),
    ...style,
  } as React.CSSProperties;

  return <div ref={containerRef} className={rootClassName} style={containerStyle} role="region" aria-label={ariaLabel}>
    <div className="logoloop__track">
      {Array.from({ length: copies }, (_, index) => (
        <ul className="logoloop__list" key={`set-${index}`} aria-hidden={index > 0}>{logos.map((item, itemIndex) => renderLogo(item, `${index}-${itemIndex}`))}</ul>
      ))}
    </div>
    <ul ref={measureRef} className="logoloop__list logoloop__measure" aria-hidden>{logos.map((item, index) => renderLogo(item, `measure-${index}`))}</ul>
  </div>;
}
