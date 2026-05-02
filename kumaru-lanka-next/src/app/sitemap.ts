import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.KL_SITE_URL || "https://kumarulanka.lk";
  const now = new Date();

  return [
    { url: `${baseUrl}/`, lastModified: now },
    { url: `${baseUrl}/tours`, lastModified: now },
    { url: `${baseUrl}/destinations`, lastModified: now },
    { url: `${baseUrl}/vehicles`, lastModified: now },
    { url: `${baseUrl}/reviews`, lastModified: now },
    { url: `${baseUrl}/blog`, lastModified: now },
    { url: `${baseUrl}/book`, lastModified: now },
  ];
}

