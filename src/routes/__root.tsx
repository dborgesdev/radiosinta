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
import { reportError } from "../lib/error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060913] px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-white">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-white">Página não encontrada</h2>
        <p className="mt-2 text-sm text-[#8b949e]">
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-[#ff9100] px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-[#ff9100]/90"
          >
            Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060913] px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-white">
          Esta página não pôde ser carregada
        </h1>
        <p className="mt-2 text-sm text-[#8b949e]">
          Algo deu errado do nosso lado. Você pode tentar recarregar a página ou voltar para o
          início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-[#ff9100] px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-[#ff9100]/90"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-[#30363d] bg-[#161b22] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#21262d]"
          >
            Voltar para o início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "robots", content: "index, follow" },

      /* SEO Primário Google */
      { title: "Rádio Sinta — Sinta a presença de Deus" },
      {
        name: "description",
        content:
          "Rádio Sinta: Sinta a presença de Deus através de louvores selecionados e mensagens de paz. Rádio online 24h tocando sempre o que acalma seu coração.",
      },
      { name: "author", content: "Rádio Sinta" },
      { name: "theme-color", content: "#060913" },

      /* Open Graph / Facebook */
      { property: "og:title", content: "Rádio Sinta — Sinta a presença de Deus" },
      {
        property: "og:description",
        content:
          "Sinta a presença de Deus. Ouça ao vivo a melhor transmissão digital de louvores e mensagens de paz, onde você estiver.",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:site_name", content: "Rádio Sinta" },
      { property: "og:image", content: "/og-image.webp" },
      {
        property: "og:image:alt",
        content: "Logotipo Oficial Rádio Sinta — Sinta a presença de Deus",
      },

      /* Twitter Cards */
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Rádio Sinta — Sinta a presença de Deus" },
      {
        name: "twitter:description",
        content:
          "Sinta a presença de Deus. Transmissão contínua com louvores selecionados e mensagens de paz.",
      },
      { name: "twitter:image", content: "/og-image.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
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
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
