"use client";

// On-page design switcher state. Two directions differ in the Rooms and
// Gallery sections:
//   "stack"   — stacking room cards + parallax mosaic gallery (hrast-stack)
//   "classic" — pinned-column rooms + horizontal strip gallery (hrast)
// The choice is held in React state for instant switching and mirrored to a
// `design` cookie so it survives reloads and the server renders the right one.

import { createContext, useContext, useState } from "react";

export type Design = "stack" | "classic";

const DesignContext = createContext<{
  design: Design;
  setDesign: (d: Design) => void;
}>({ design: "stack", setDesign: () => {} });

export function DesignProvider({
  initial,
  children,
}: {
  initial: Design;
  children: React.ReactNode;
}) {
  const [design, setDesignState] = useState<Design>(initial);

  const setDesign = (d: Design) => {
    setDesignState(d);
    // 1 year, root path — read back server-side on the next request.
    document.cookie = `design=${d}; path=/; max-age=31536000; samesite=lax`;
  };

  return (
    <DesignContext.Provider value={{ design, setDesign }}>
      {children}
    </DesignContext.Provider>
  );
}

export function useDesign() {
  return useContext(DesignContext);
}
