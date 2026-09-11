import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

type Photo = {
  fichier: string;
  vignette: string;
};

type Album = {
  titre: string;
  photos: Photo[];
};

export const Route = createFileRoute("/photos")({
  head: () => ({
    meta: [
      { title: "Photos — Test stockage ABIIF" },
      { name: "description", content: "Albums photos ABIIF." },
      { property: "og:title", content: "Photos — Test stockage ABIIF" },
      { property: "og:description", content: "Albums photos ABIIF." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PhotosPage,
});

function PhotosPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [albumOuvert, setAlbumOuvert] = useState<Album | null>(null);
  const [photoOuverte, setPhotoOuverte] = useState<Photo | null>(null);

  useEffect(() => {
    fetch("/media/photos/manifest.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Album[]) => setAlbums(data))
      .catch((e: Error) => setErreur(e.message));
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Photos</h1>

      {erreur && (
        <p className="mt-4 text-sm text-destructive">Erreur de chargement : {erreur}</p>
      )}

      {!albumOuvert ? (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <li key={album.titre}>
              <button
                type="button"
                onClick={() => setAlbumOuvert(album)}
                className="w-full rounded-md border border-border p-4 text-left transition-colors hover:bg-accent"
              >
                <span className="block font-semibold text-foreground">{album.titre}</span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {album.photos.length} photo{album.photos.length > 1 ? "s" : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <section className="mt-6">
          <button
            type="button"
            onClick={() => setAlbumOuvert(null)}
            className="text-sm text-muted-foreground underline hover:text-foreground"
          >
            ← Retour aux albums
          </button>
          <h2 className="mt-3 text-xl font-semibold text-foreground">{albumOuvert.titre}</h2>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {albumOuvert.photos.map((photo) => (
              <li key={photo.fichier}>
                <button type="button" onClick={() => setPhotoOuverte(photo)}>
                  <img
                    src={photo.vignette}
                    alt={albumOuvert.titre}
                    loading="lazy"
                    width={160}
                    height={160}
                    className="h-40 w-full rounded-md border border-border object-cover"
                  />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {photoOuverte && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4"
          onClick={() => setPhotoOuverte(null)}
        >
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => setPhotoOuverte(null)}
            className="absolute top-4 right-4 rounded-md border border-border bg-background px-3 py-1 text-sm text-foreground"
          >
            ✕
          </button>
          <img
            src={photoOuverte.fichier}
            alt={albumOuvert?.titre ?? "Photo"}
            className="max-h-[85vh] max-w-full rounded-md object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </main>
  );
}
