"use client";

import { createContext, useContext } from "react";

export const InstitucionContext = createContext(null);

export function useInstitucionContext() {
  return useContext(InstitucionContext);
}

