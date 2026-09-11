import { createFileRoute } from "@tanstack/react-router";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

type Enregistrement = {
  fichier: string;
  annee: string;
};

type Chant = {
  titre: string;
  enregistrements: Enregistrement[];
};

// Recherche insensible aux accents et à la casse : « jesus » trouve « Jésus ».
const normaliser = (texte: string) =>
  texte.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

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
  // La saisie reste fluide : le filtrage de la liste passe après l'affichage de la lettre tapée.
  const rechercheDifferee = useDeferredValue(recherche);
  const [enCours, setEnCours] = useState<{ titre: string; enr: Enregistrement } | null>(null);
  const [lecture, setLecture] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetch("/media/audio/manifest.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Chant[]) => setChants(data))
      .catch((e: Error) => setErreur(e.message));
  }, []);

  const index = useMemo(
    () => chants.map((chant) => ({ chant, cle: normaliser(chant.titre) })),
    [chants],
  );

  const filtres = useMemo(() => {
    const q = normaliser(rechercheDifferee.trim());
    if (!q) return chants;
    return index.filter((x) => x.cle.includes(q)).map((x) => x.chant);
  }, [index, chants, rechercheDifferee]);

  // Un seul lecteur audio pour toute la page, piloté par les boutons de chaque enregistrement.
  const ecouter = (titre: string, enr: Enregistrement) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (enCours?.enr.fichier === enr.fichier) {
      if (audio.paused) audio.play().catch(() => {});
      else audio.pause();
      return;
    }
    audio.src = enr.fichier;
    audio.play().catch(() => {});
    setEnCours({ titre, enr });
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 pb-32">
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

      <ul className="mt-6 space-y-4">
        {filtres.map((chant) => (
          <li key={chant.titre} className="rounded-md border border-border p-4">
            <h2 className="text-lg font-semibold text-foreground">{chant.titre}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {chant.enregistrements.map((enr) => {
                const actif = enCours?.enr.fichier === enr.fichier;
                return (
                  <button
                    key={enr.fichier}
                    type="button"
                    onClick={() => ecouter(chant.titre, enr)}
                    aria-label={`Écouter ${chant.titre}${enr.annee ? `, enregistrement ${enr.annee}` : ""}`}
                    className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                      actif
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-foreground hover:bg-accent"
                    }`}
                  >
                    {actif && lecture ? "❚❚" : "▶"} {enr.annee || "Écouter"}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>

      {!erreur && chants.length > 0 && filtres.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">Aucun chant trouvé.</p>
      )}

      <div
        hidden={!enCours}
        className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 p-3 backdrop-blur"
      >
        <div className="mx-auto max-w-3xl">
          <p className="mb-2 truncate text-sm font-medium text-foreground">
            {enCours?.titre}
            {enCours?.enr.annee ? ` (${enCours.enr.annee})` : ""}
          </p>
          <audio
            ref={audioRef}
            controls
            preload="none"
            className="w-full"
            onPlay={() => setLecture(true)}
            onPause={() => setLecture(false)}
            onEnded={() => setLecture(false)}
          />
        </div>
      </div>
    </main>
  );
}
