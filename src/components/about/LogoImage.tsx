import Image from "next/image";
import { cn } from "@/lib/utils";

export function LogoImage({
  src,
  alt,
  variant = "mark",
  className,
  priority,
}: {
  src: string;
  alt: string;
  variant?: "mark" | "wide";
  className?: string;
  priority?: boolean;
}) {
  const base =
    variant === "wide"
      ? "h-14 w-full max-w-[14rem] sm:h-16 sm:max-w-[16rem]"
      : "h-14 w-14 sm:h-16 sm:w-16";

  const wrapper = variant === "wide" ? "relative w-full max-w-full" : "relative shrink-0 max-w-full";

  return (
    <div className={cn(wrapper, "mx-auto", base, className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={variant === "wide" ? "256px" : "64px"}
        className="object-contain"
        priority={priority}
      />
    </div>
  );
}
