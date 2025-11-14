"use client";

import { useRef, useEffect, useState } from "react";
import { HeaderHeightContext } from "@/contexts/HeaderHeightContext";

export default function HeaderHeightProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (!headerRef.current) return;

    const updateHeight = () => {
      setHeaderHeight(headerRef.current!.offsetHeight);
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(headerRef.current);

    window.addEventListener("resize", updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  return (
    <HeaderHeightContext.Provider value={headerHeight}>
      <div ref={headerRef}>
        {children}
      </div>
    </HeaderHeightContext.Provider>
  );
}
