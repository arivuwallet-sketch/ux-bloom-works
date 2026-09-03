import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const ImmersiveScene = lazy(() => import("@/components/three/ImmersiveScene"));

export function ImmersiveBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-background" />
      <ClientOnly fallback={null}>
        <Suspense fallback={null}>
          <div className="absolute inset-0 opacity-90">
            <ImmersiveScene />
          </div>
        </Suspense>
      </ClientOnly>
      {/* readability veil + film grain */}
      <div className="veil absolute inset-0" />
      <div className="grain absolute inset-0" />
    </div>
  );
}
