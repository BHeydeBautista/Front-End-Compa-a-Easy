import { HeroCarousel } from "@/components/hero/HeroCarousel";
import { Section } from "@/components/ui/Section";
import Image from "next/image";
import { readdir } from "node:fs/promises";
import path from "node:path";

async function getGalleryImages() {
  const directory = path.join(process.cwd(), "public", "img");
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => /\.(png|jpe?g|webp|avif)$/i.test(name))
      .sort()
      .reverse();

    return files.map((name) => ({
      src: `/img/${name}`,
      alt: "Imagen de la galería",
    }));
  } catch {
    return [] as Array<{ src: string; alt: string }>;
  }
}

export default async function Home() {
  const galleryImages = await getGalleryImages();

  return (
    <div>
      <HeroCarousel />

      <Section
        id="galeria"
        title="Galería"
        subtitle="Momentos destacados, entrenamientos y operaciones."
      >
        {galleryImages.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {galleryImages.map((img, index) => (
              <div
                key={img.src}
                className="relative aspect-video overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/5"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                  priority={index < 3}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="aspect-video rounded-2xl border border-foreground/10 bg-foreground/5"
              />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
