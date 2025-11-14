"use client";

import { createContext, useContext } from "react";

export const HeaderHeightContext = createContext<number>(0);

export function useHeaderHeight() {
  return useContext(HeaderHeightContext);
}
