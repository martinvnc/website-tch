import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Parse image_url field: supports JSON array string or legacy single URL */
export function parseImageUrls(imageUrl: string | null): string[] {
  if (!imageUrl) return [];
  if (imageUrl.startsWith("[")) {
    try {
      const arr = JSON.parse(imageUrl);
      return Array.isArray(arr) ? arr.filter((u: string) => typeof u === "string" && u.length > 0) : [];
    } catch {
      return [];
    }
  }
  return [imageUrl];
}
