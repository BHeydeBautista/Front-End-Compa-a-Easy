import { HeroCarousel } from "@/components/hero/HeroCarousel";
import { Section } from "@/components/ui/Section";
import Image from "next/image";

const galleryImages: Array<{ src: string; alt: string }> = [
  { src: "/img/20260107231154_1.jpg", alt: "Galería" },
  { src: "/img/20260107231837_1.jpg", alt: "Galería" },
  { src: "/img/20260107232105_1.jpg", alt: "Galería" },
  { src: "/img/20260108005839_1.jpg", alt: "Galería" },
  { src: "/img/20260108005911_1.jpg", alt: "Galería" },
  { src: "/img/20260108005921_1.jpg", alt: "Galería" },
  { src: "/img/20260123233002_1.jpg", alt: "Galería" },
  { src: "/img/20260123233006_1.jpg", alt: "Galería" },
  { src: "/img/20260123233043_1.jpg", alt: "Galería" },
  { src: "/img/20260205002446_1.jpg", alt: "Galería" },
  { src: "/img/20260212004024_1.jpg", alt: "Galería" },
];

export default function Home() {
  return (
    <div>
      <HeroCarousel />

      <Section
        id="galeria"
        title="Galería"
        subtitle="Momentos destacados, entrenamientos y operaciones."
      >
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
      </Section>
    </div>
  );
}
