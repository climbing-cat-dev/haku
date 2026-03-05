import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.climbingcat.dev",
      lastModified: new Date(),
    },
  ];
}
