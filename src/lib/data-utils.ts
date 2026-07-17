import { getCollection, type CollectionEntry } from 'astro:content'

export async function getAllPosts(): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCollection('blog')
  return posts
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

export async function getRecentPosts(
  count: number,
): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getAllPosts()
  return posts.slice(0, count)
}

export async function getAdjacentPosts(currentId: string): Promise<{
  prev: CollectionEntry<'blog'> | null
  next: CollectionEntry<'blog'> | null
}> {
  const posts = await getAllPosts()
  const currentIndex = posts.findIndex((post) => post.id === currentId)

  if (currentIndex === -1) {
    return { prev: null, next: null }
  }

  return {
    next: currentIndex > 0 ? posts[currentIndex - 1] : null,
    prev: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null,
  }
}

export async function getAllAuthors(): Promise<CollectionEntry<'authors'>[]> {
  return await getCollection('authors')
}

export async function getAllProjects(): Promise<CollectionEntry<'projects'>[]> {
  const projects = await getCollection('projects')
  return projects.sort((a, b) => {
    const dateA = a.data.startDate?.getTime() || 0
    const dateB = b.data.startDate?.getTime() || 0
    return dateB - dateA
  })
}

export async function getAllTags(): Promise<Map<string, number>> {
  const posts = await getAllPosts()

  return posts.reduce((acc, post) => {
    post.data.tags?.forEach((tag) => {
      acc.set(tag, (acc.get(tag) || 0) + 1)
    })
    return acc
  }, new Map<string, number>())
}

export async function getSortedTags(): Promise<
  { tag: string; count: number }[]
> {
  const tagCounts = await getAllTags()

  return [...tagCounts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => {
      const countDiff = b.count - a.count
      return countDiff !== 0 ? countDiff : a.tag.localeCompare(b.tag)
    })
}

export function groupPostsByYear(
  posts: CollectionEntry<'blog'>[],
): Record<string, CollectionEntry<'blog'>[]> {
  return posts.reduce(
    (acc: Record<string, CollectionEntry<'blog'>[]>, post) => {
      const year = post.data.date.getFullYear().toString()
      ;(acc[year] ??= []).push(post)
      return acc
    },
    {},
  )
}

export async function parseAuthors(authorIds: string[] = []) {
  if (!authorIds.length) return []

  const allAuthors = await getAllAuthors()
  const authorMap = new Map(allAuthors.map((author) => [author.id, author]))

  return authorIds.map((id) => {
    const author = authorMap.get(id)

    return {
      id,
      name: author?.data?.name || id,
      avatar: author?.data?.avatar || '/static/logo.png',
      isRegistered: !!author,
    }
  })
}

export async function getPostsByAuthor(
  authorId: string,
): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getAllPosts()
  return posts.filter((post) => post.data.authors?.includes(authorId))
}

export async function getPostsByTag(
  tag: string,
): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getAllPosts()
  return posts.filter((post) => post.data.tags?.includes(tag))
}

// --- Related posts by content similarity (TF-IDF + cosine) ---------------
// Computed once per build over the whole corpus. No manual tagging needed:
// ranking is driven by post text, with a light boost for shared tags.

const STOPWORDS = new Set([
  // English
  'the',
  'and',
  'for',
  'are',
  'but',
  'not',
  'you',
  'your',
  'with',
  'this',
  'that',
  'have',
  'has',
  'was',
  'were',
  'will',
  'can',
  'all',
  'its',
  'from',
  'they',
  'them',
  'their',
  'what',
  'when',
  'who',
  'why',
  'how',
  'get',
  'got',
  'out',
  'about',
  'into',
  'more',
  'than',
  'then',
  'there',
  'here',
  'been',
  'just',
  'like',
  'some',
  'any',
  'our',
  'his',
  'her',
  'she',
  'him',
  'one',
  'two',
  'also',
  'because',
  'which',
  'would',
  'could',
  'should',
  'does',
  'did',
  // Italian
  'che',
  'non',
  'per',
  'con',
  'una',
  'del',
  'della',
  'dei',
  'delle',
  'gli',
  'sono',
  'come',
  'più',
  'anche',
  'ma',
  'se',
  'nel',
  'nella',
  'alla',
  'dal',
  'questo',
  'questa',
  'sono',
  'ci',
  'ho',
  'hai',
  'fa',
  'lo',
  'le',
  'un',
  'in',
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/```[\s\S]*?```/g, ' ') // strip fenced code blocks
    .replace(/<[^>]+>/g, ' ') // strip html/jsx tags
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // keep link text, drop urls
    .replace(/https?:\/\/\S+/g, ' ') // strip bare urls
    .replace(/[^a-zà-ÿ0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t))
}

let relatedCache: Map<string, CollectionEntry<'blog'>[]> | null = null

async function computeRelatedPosts(): Promise<
  Map<string, CollectionEntry<'blog'>[]>
> {
  const posts = await getAllPosts()
  const N = posts.length

  // Term frequencies per document (title weighted 3x).
  const tfs = posts.map((post) => {
    const text = `${post.data.title} ${post.data.title} ${post.data.title} ${
      post.data.description ?? ''
    } ${post.body ?? ''}`
    const tf = new Map<string, number>()
    for (const term of tokenize(text)) tf.set(term, (tf.get(term) ?? 0) + 1)
    return tf
  })

  // Document frequency across the corpus.
  const df = new Map<string, number>()
  for (const tf of tfs) {
    for (const term of tf.keys()) df.set(term, (df.get(term) ?? 0) + 1)
  }

  // Normalized TF-IDF vectors.
  const vectors = tfs.map((tf) => {
    const vec = new Map<string, number>()
    let norm = 0
    for (const [term, freq] of tf) {
      const idf = Math.log(N / df.get(term)!)
      const w = (1 + Math.log(freq)) * idf
      if (w > 0) {
        vec.set(term, w)
        norm += w * w
      }
    }
    norm = Math.sqrt(norm) || 1
    for (const [term, w] of vec) vec.set(term, w / norm)
    return vec
  })

  const result = new Map<string, CollectionEntry<'blog'>[]>()
  posts.forEach((post, i) => {
    const tagsA = new Set(post.data.tags ?? [])
    const scored = posts.map((other, j) => {
      if (i === j) return { j, score: -1 }
      // Cosine similarity (iterate the smaller vector).
      const [a, b] =
        vectors[i].size < vectors[j].size
          ? [vectors[i], vectors[j]]
          : [vectors[j], vectors[i]]
      let dot = 0
      for (const [term, w] of a) {
        const bw = b.get(term)
        if (bw) dot += w * bw
      }
      const overlap = (other.data.tags ?? []).filter((t) => tagsA.has(t)).length
      return { j, score: dot + overlap * 0.05 }
    })
    scored.sort((x, y) => y.score - x.score)
    result.set(
      post.id,
      scored
        .filter((s) => s.score > 0)
        .slice(0, 10)
        .map((s) => posts[s.j]),
    )
  })
  return result
}

export async function getRelatedPosts(
  postId: string,
  count = 3,
): Promise<CollectionEntry<'blog'>[]> {
  if (!relatedCache) relatedCache = await computeRelatedPosts()
  return (relatedCache.get(postId) ?? []).slice(0, count)
}
