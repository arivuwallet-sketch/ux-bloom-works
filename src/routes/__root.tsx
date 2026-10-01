import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import archiveCss from "../archive-global.css?url";
import archiveWorkspaceCss from "../archive-workspace.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header, Footer } from "@/components/site/Header";
import { ImmersiveBackground } from "@/components/site/ImmersiveBackground";

function NotFoundComponent() {
  return (
    <main className="system-state">
      <div className="system-state__card">
        <span className="eyebrow">404 / missing entry</span>
        <h1>This page is outside the archive.</h1>
        <p>The route no longer exists, or the interface index changed.</p>
        <Link to="/" className="button-primary">Return to Rezyn</Link>
      </div>
    </main>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void; info?: unknown }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <main className="system-state">
      <div className="system-state__card">
        <span className="eyebrow">runtime / interrupted</span>
        <h1>The archive hit a runtime error.</h1>
        <p>Retry this view without losing your place, or return to the main index.</p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="button-primary"
          >
            Retry view
          </button>
          <a href="/" className="button-secondary">Go home</a>
        </div>
      </div>
    </main>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#f1eee4" },
      { title: "Rezyn — AI interface transformation studio" },
      {
        name: "description",
        content:
          "Transform existing websites, web apps, mobile apps, SaaS products and stores into polished modern interfaces while keeping their structure and logic intact.",
      },
      { name: "author", content: "Rezyn" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: archiveCss },
      { rel: "stylesheet", href: archiveWorkspaceCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent as never,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-shell archive-app">
        <ImmersiveBackground />
        <Header />
        <div className="route-stage"><Outlet /></div>
        <Footer />
      </div>
    </QueryClientProvider>
  );
}
