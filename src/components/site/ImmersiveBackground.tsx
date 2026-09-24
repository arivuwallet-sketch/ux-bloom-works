import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef } from "react";

const ImmersiveScene = lazy(() => import("@/components/three/ImmersiveScene"));

/** Cursor-tracked glow layered over the 3D scene — cheap, CSS-only depth cue. */
function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let raf = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        node.style.setProperty("--mx", `${e.clientX}px`);
        node.style.setProperty("--my", `${e.clientY}px`);
        node.classList.add("is-active");
      });
    };
    const leave = () => node.classList.remove("is-active");

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerleave", leave);
    };
  }, []);

  return <div ref={ref} className="cursor-spotlight" aria-hidden />;
}

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
      <ClientOnly fallback={null}>
        <CursorSpotlight />
      </ClientOnly>
      {/* readability veil + film grain */}
      <div className="veil absolute inset-0" />
      <div className="grain absolute inset-0" />
    </div>
  );
}
