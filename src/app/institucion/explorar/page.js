"use client";

import { Suspense } from "react";
import ExploreView from "@/components/explorar/ExploreView";

export default function InstitucionExplorarPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-text-muted">Cargando explorador…</div>}>
      <ExploreView />
    </Suspense>
  );
}
