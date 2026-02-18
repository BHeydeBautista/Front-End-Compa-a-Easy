export function cloudinaryImageUrl(
  publicId: string | null | undefined,
  opts?: {
    w?: number;
    h?: number;
    crop?: "fill" | "fit" | "limit";
    gravity?: string;
  },
) {
  const id = String(publicId ?? "").trim();
  if (!id) return null;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return null;

  const transforms: string[] = ["f_auto", "q_auto"];
  const crop = opts?.crop ?? "fill";
  if (opts?.w) transforms.push(`w_${Math.max(1, Math.floor(opts.w))}`);
  if (opts?.h) transforms.push(`h_${Math.max(1, Math.floor(opts.h))}`);
  if (crop) transforms.push(`c_${crop}`);
  if (opts?.gravity) transforms.push(`g_${opts.gravity}`);

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms.join(",")}/${id}`;
}
