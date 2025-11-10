import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.awajahi.com/',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://www.awajahi.com/terms',
      lastModified: new Date('2024-10-21'),
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    {
      url: 'https://www.awajahi.com/privacy-policy',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.7,
    }
  ];
}
