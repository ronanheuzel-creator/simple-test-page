import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Test stockage ABIIF" },
      { name: "description", content: "Page d’accueil de test pour le stockage ABIIF." },
      { property: "og:title", content: "Test stockage ABIIF" },
      { property: "og:description", content: "Page d’accueil de test pour le stockage ABIIF." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <h1 className="text-center text-4xl font-bold tracking-tight text-foreground">
        Test stockage ABIIF
      </h1>
    </main>
  );
}
