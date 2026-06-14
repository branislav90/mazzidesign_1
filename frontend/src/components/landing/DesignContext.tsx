"use client";

// Holds the chosen design in React state (instant Rooms/Gallery layout swap) and
// mirrors it to: the `design` cookie (so the server renders the last choice), and
// `data-theme` on <html> (so the palette applies across every page — landing,
// configurator, admin). The server already sets both on first paint, so there's
// no flash; this only keeps them in sync on a live switch.

import { createContext, useContext, useState } from "react";
import { type Design, THEME_OF } from "@/lib/design";

const DesignContext = createContext<{
  design: Design;
  setDesign: (d: Design) => void;
}>({ design: "modern", setDesign: () => {} });

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
    document.cookie = `design=${d}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.dataset.theme = THEME_OF[d];
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
