"use client";

// .rv reveal from hrast: opacity 0 / translateY(26px) / blur(6px) → none over
// 1.3s var(--ease), triggered once at 20% visibility. Reduced motion is
// handled in globals.css (.rv forced visible).

import { useEffect, useRef } from "react";

export default function Reveal({
  className,
  children,
  style,
}: {
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("in");
            io.unobserve(el);
          }
        }),
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`rv ${className ?? ""}`} style={style}>
      {children}
    </div>
  );
}
