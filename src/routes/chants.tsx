import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

type Enregistrement = {
  fichier: string;
  annee: string;
};

type Chant = {
  titre: string;
  enregistrements: Enregistrement[];
};

export const Route = createFileRoute("/chants")({
  head: () => ({
    meta: [
      { title: "Chants — Test stockage ABIIF" },
      { name: "description", content: "Liste des chants ABIIF avec lecteurs audio." },
      { property: "og:title", content: "Chants — Test stockage ABIIF" },
      { property: "og:description", content: "Liste des chants ABIIF avec lecteurs audio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChantsPage,
});

function ChantsPage() {
  const [chants, setChants] = useState<Chant[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [recherche, setRecherche] = useState("");

  useEffect(() => {
    fetch("/media/audio/manifest.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Chant[]) => setChants(data))
      .catch((e: Error) => setErreur(e.message));
  }, []);

  const filtres = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return chants;
    return chants.filter((c) => c.titre.toLowerCase().includes(q));
  }, [chants, recherche]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Chants</h1>

      <input
        type="search"
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        placeholder="Rechercher un chant…"
        aria-label="Rechercher un chant"
        className="mt-6 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
      />

      {erreur && (
        <p className="mt-4 text-sm text-destructive">Erreur de chargement : {erreur}</p>
      )}

      <ul className="mt-6 space-y-6">
        {filtres.map((chant) => (
          <li key={chant.titre} className="rounded-md border border-border p-4">
            <h2 className="text-lg font-semibold text-foreground">{chant.titre}</h2>
            <ul className="mt-3 space-y-3">
              {chant.enregistrements.map((enr) => (
                <li key={enr.fichier} className="flex items-center gap-3">
                  <span className="w-12 shrink-0 text-sm text-muted-foreground">{enr.annee}</span>
                  <audio controls preload="none" src={enr.fichier} className="w-full">
                    Votre navigateur ne supporte pas la lecture audio.
                  </audio>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      {!erreur && filtres.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">Aucun chant trouvé.</p>
      )}
    </main>
  );
}
