import { SITE, SOCIAL_LINKS } from '@/consts'
import type { CollectionEntry } from 'astro:content'

// Canonical linked-data URI for Piero as an entity. Every Article/VideoObject
// references this @id so search engines collapse them into one graph node.
export const PERSON_ID = `${SITE.href}/#piero`

/** The Person node describing Piero — reused on the home page and every post. */
export function personSchema() {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: 'Piero Savastano',
    url: SITE.href,
    image: `${SITE.href}/android-chrome-512x512.png`,
    jobTitle: 'AI consultant, trainer and speaker',
    description: SITE.description,
    sameAs: SOCIAL_LINKS.map((l) => l.href).filter(
      (h) => !h.startsWith('mailto:') && h.startsWith('http'),
    ),
  }
}

/** Home-page graph: a ProfilePage about Piero, plus the Person node itself. */
export function profileGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': `${SITE.href}/#profilepage`,
        url: SITE.href,
        name: SITE.title,
        mainEntity: { '@id': PERSON_ID },
      },
      personSchema(),
    ],
  }
}

/**
 * Per-post graph: BlogPosting authored by Piero, plus (when the post comes from
 * a YouTube video) a VideoObject the article is about. `pageUrl` is the post's
 * canonical URL (pass Astro.url.href).
 */
export function postGraph(post: CollectionEntry<'blog'>, pageUrl: string) {
  const { title, description, date, image, videoId, duration } = post.data
  const canonical = pageUrl.replace(/#.*$/, '')
  const imageUrl = image ? `${SITE.href}${image.src}` : undefined

  const article: Record<string, unknown> = {
    '@type': 'BlogPosting',
    '@id': `${canonical}#article`,
    headline: title,
    description,
    datePublished: date.toISOString(),
    dateModified: date.toISOString(),
    inLanguage: SITE.locale,
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
    mainEntityOfPage: canonical,
    ...(imageUrl && { image: imageUrl }),
    ...(post.data.tags?.length && { keywords: post.data.tags.join(', ') }),
    ...(videoId && { video: { '@id': `${canonical}#video` } }),
  }

  const video = videoId
    ? {
        '@type': 'VideoObject',
        '@id': `${canonical}#video`,
        name: title,
        description,
        uploadDate: date.toISOString(),
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        contentUrl: `https://www.youtube.com/watch?v=${videoId}`,
        author: { '@id': PERSON_ID },
        publisher: { '@id': PERSON_ID },
        ...(duration && { duration }),
      }
    : null

  return {
    '@context': 'https://schema.org',
    '@graph': [personSchema(), article, ...(video ? [video] : [])],
  }
}
