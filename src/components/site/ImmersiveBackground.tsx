import { ClientOnly, useLocation } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef } from "react";

const ImmersiveScene = lazy(() => import("@/components/three/ImmersiveScene"));

function CursorField() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia("(pointer: coarse)").matches) return;

    let frame = 0;
    const move = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        node.style.setProperty("--mx", `${event.clientX}px`);
        node.style.setProperty("--my", `${event.clientY}px`);
      });
    };

    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
    };
  }, []);

  return <div ref={ref} className="cursor-field" aria-hidden />;
}

export function ImmersiveBackground() {
  const location = useLocation();

  return (
    <div className="immersive-world" aria-hidden>
      <ClientOnly fallback={<div className="immersive-world__fallback" />}>
        <Suspense fallback={<div className="immersive-world__fallback" />}>
          <div className="immersive-world__canvas">
            <ImmersiveScene pathname={location.pathname} />
          </div>
        </Suspense>
      </ClientOnly>
      <ClientOnly fallback={null}>
        <CursorField />
      </ClientOnly>
      <div className="world-grid" />
      <div className="world-scan" />
      <div className="world-vignette" />
      <div className="grain" />
    </div>
  );
}
