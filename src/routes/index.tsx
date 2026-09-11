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
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-center text-4xl font-bold tracking-tight text-foreground">
        Test stockage ABIIF
      </h1>
      <nav className="flex gap-4">
        <Link
          to="/chants"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Chants
        </Link>
        <Link
          to="/photos"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Photos
        </Link>
      </nav>
    </main>
  );
}
