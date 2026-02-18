import { HeroCarousel } from "@/components/hero/HeroCarousel";
import { Section } from "@/components/ui/Section";
import Image from "next/image";
import { cloudinaryImageUrl } from "@/lib/cloudinary";

type LatestGalleryResponse = {
  images: Array<{ publicId: string; slot: number }>;
};

async function getGalleryImages() {
  const backendBaseUrl = (
    process.env.AUTH_BACKEND_URL ??
    (process.env.NODE_ENV !== "production" ? "http://localhost:3001" : "")
  ).replace(/\/+$/, "");

  if (!backendBaseUrl) return [] as Array<{ src: string; alt: string }>;

  try {
    const response = await fetch(`${backendBaseUrl}/gallery/latest`, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) return [] as Array<{ src: string; alt: string }>;

    const data = (await response.json()) as LatestGalleryResponse;
    const images = (data?.images ?? [])
      .slice()
      .sort((a, b) => (a.slot ?? 0) - (b.slot ?? 0))
      .map((img) => {
        const src = cloudinaryImageUrl(img.publicId, {
          w: 1280,
          h: 720,
          crop: "fill",
        });
        if (!src) return null;
        return { src, alt: "Imagen de la galería" };
      })
      .filter(Boolean) as Array<{ src: string; alt: string }>;

    return images;
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
