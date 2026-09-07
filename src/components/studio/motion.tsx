import { useEffect, useRef, useState, type ReactNode } from "react";

/** Splits text into characters for staggered kinetic reveals. */
export function SplitText({
  text,
  className = "",
  charClassName = "",
  delay = 0,
  stagger = 0.028,
}: {
  text: string;
  className?: string;
  /** Applied to each character — use for gradient/outline text effects. */
  charClassName?: string;
  delay?: number;
  stagger?: number;
}) {
  return (
    <span className={className} aria-label={text}>
      {text.split("").map((char, i) => (
        <span
          key={`${char}-${i}`}
          aria-hidden
          className={`split-char ${charClassName}`}
          style={{ animationDelay: `${delay + i * stagger}s` }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

/** Reveals children when they scroll into view. */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} reveal${shown ? " is-in" : ""}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

/** Magnetic hover: element leans toward the pointer. */
export function Magnetic({
  children,
  strength = 14,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let frame = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = node.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        node.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
      });
    };
    const leave = () => {
      cancelAnimationFrame(frame);
      node.style.transform = "translate(0,0)";
    };
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerleave", leave);
    };
  }, [strength]);

  return (
    <span ref={ref} className={`inline-block will-change-transform transition-transform duration-300 ${className}`}>
      {children}
    </span>
  );
}

/** Infinite marquee ticker. */
export function Ticker({ items, speed = 26 }: { items: string[]; speed?: number }) {
  const row = [...items, ...items];
  return (
    <div className="ticker border-y border-border/60 py-3">
      <div className="ticker-track" style={{ animationDuration: `${speed}s` }}>
        {row.map((item, i) => (
          <span key={`${item}-${i}`} className="ticker-item">
            {item}
            <span className="mx-6 text-primary">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Blended magnetic cursor with hover state scaling. */
export function StudioCursor() {
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = dot.current;
    if (!node) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let raf = 0;

    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const target = e.target as HTMLElement | null;
      const interactive = target?.closest("a,button,input,select,textarea,[role='button']");
      node.classList.toggle("is-active", Boolean(interactive));
    };

    const loop = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      node.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", move);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={dot} className="studio-cursor" aria-hidden />;
}
