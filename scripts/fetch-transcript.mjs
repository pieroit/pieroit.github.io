#!/usr/bin/env node
// Fetch YouTube captions + metadata for videos that don't yet have a blog post.
//
// Usage:
//   node scripts/fetch-transcript.mjs                # latest 10 pending channel videos
//   node scripts/fetch-transcript.mjs --limit 5      # latest 5 pending
//   node scripts/fetch-transcript.mjs <url|id> ...   # specific videos (skips channel scan)
//   node scripts/fetch-transcript.mjs --lang en      # override caption language
//
// For each selected video it writes scripts/.work/<id>/{meta.json,transcript.txt,cover.jpg}
// and prints a JSON summary { pending: [...], done: [...] } to stdout.
//
// Dependency-free: it downloads the standalone yt-dlp binary to scripts/.bin/yt-dlp
// on first run (needs system python3, no pip). See .claude/skills/video-to-blog/.

import { spawnSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const BIN = join(__dirname, '.bin', 'yt-dlp')
const WORK = join(__dirname, '.work')
const BLOG_DIR = join(ROOT, 'src', 'content', 'blog')
const CHANNEL = 'https://www.youtube.com/@PieroSavastano/videos'

// ---------- args ----------
const argv = process.argv.slice(2)
let limit = 10
let lang = null
const explicit = []
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (a === '--limit') limit = parseInt(argv[++i], 10)
  else if (a === '--lang') lang = argv[++i]
  else if (a.startsWith('--')) throw new Error(`Unknown flag: ${a}`)
  else explicit.push(a)
}

// ---------- yt-dlp helpers ----------
function yt(args, opts = {}) {
  const res = spawnSync(BIN, ['--js-runtimes', 'node', ...args], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    ...opts,
  })
  if (res.error) throw res.error
  return res
}

async function ensureBin() {
  if (existsSync(BIN)) return
  mkdirSync(dirname(BIN), { recursive: true })
  process.stderr.write('Downloading yt-dlp binary...\n')
  const url = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp'
  const res = await fetch(url)
  if (!res.ok) throw new Error(`yt-dlp download failed: ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  writeFileSync(BIN, buf, { mode: 0o755 })
}

// video id from a url or bare id
function videoId(s) {
  const m = s.match(/(?:v=|\/embed\/|youtu\.be\/|\/shorts\/)([\w-]{11})/)
  return m ? m[1] : s
}

// ---------- existing posts ----------
function publishedVideoIds() {
  const ids = new Set()
  if (!existsSync(BLOG_DIR)) return ids
  for (const slug of readdirSync(BLOG_DIR)) {
    for (const file of ['index.mdx', 'index.md']) {
      const p = join(BLOG_DIR, slug, file)
      if (!existsSync(p)) continue
      const m = readFileSync(p, 'utf8').match(
        /^videoId:\s*['"]?([\w-]{11})['"]?/m,
      )
      if (m) ids.add(m[1])
    }
  }
  return ids
}

// ---------- caption cleanup ----------
// YouTube auto-captions use a rolling window: each cue repeats the previous
// line plus the new one. Flatten cue lines in order and drop consecutive
// duplicates to recover clean running text.
function srtToText(srt) {
  const lines = []
  for (const block of srt.split(/\r?\n\r?\n/)) {
    const rows = block.split(/\r?\n/)
    for (const row of rows) {
      const t = row.trim()
      if (!t || /^\d+$/.test(t) || t.includes('-->')) continue
      const clean = t
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
      if (clean && clean !== lines[lines.length - 1]) lines.push(clean)
    }
  }
  return lines.join(' ').replace(/\s+/g, ' ').trim()
}

function isoDuration(seconds) {
  const s = Math.round(Number(seconds) || 0)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `PT${h ? h + 'H' : ''}${m ? m + 'M' : ''}${sec || (!h && !m) ? sec + 'S' : ''}`
}

// ---------- per-video fetch ----------
function fetchVideo(id) {
  const dir = join(WORK, id)
  mkdirSync(dir, { recursive: true })
  const url = `https://www.youtube.com/watch?v=${id}`

  // metadata: title | upload_date | duration(seconds) | language
  const meta = yt([
    '--skip-download',
    '--print',
    '%(title)s\t%(upload_date)s\t%(duration)s\t%(language)s',
    url,
  ])
  const printed = meta.stdout.trim().split('\n').pop() || ''
  const [title, upload, dur, vlang] = printed.split('\t')
  const useLang = lang || (vlang && vlang !== 'NA' ? vlang : 'it')

  // captions -> srt
  yt([
    '--skip-download',
    '--write-auto-subs',
    '--write-subs',
    '--sub-langs',
    useLang,
    '--convert-subs',
    'srt',
    '-o',
    join(dir, 'sub.%(ext)s'),
    url,
  ])
  const srtFile = readdirSync(dir).find((f) => f.endsWith('.srt'))
  const transcript = srtFile
    ? srtToText(readFileSync(join(dir, srtFile), 'utf8'))
    : ''

  // thumbnail -> cover.jpg (maxres, converted to jpg)
  yt([
    '--skip-download',
    '--write-thumbnail',
    '--convert-thumbnails',
    'jpg',
    '-o',
    join(dir, 'cover.%(ext)s'),
    url,
  ])
  const coverFile = readdirSync(dir).find((f) => /^cover\.jpe?g$/.test(f))
  const coverPath = coverFile ? join(dir, coverFile) : null

  const date =
    upload && upload !== 'NA'
      ? `${upload.slice(0, 4)}-${upload.slice(4, 6)}-${upload.slice(6, 8)}`
      : null

  const meta_ = {
    videoId: id,
    title,
    date,
    duration: dur && dur !== 'NA' ? isoDuration(dur) : null,
    lang: useLang,
    watchUrl: url,
    embedUrl: `https://www.youtube.com/embed/${id}`,
    transcriptChars: transcript.length,
    coverPath,
  }
  writeFileSync(join(dir, 'meta.json'), JSON.stringify(meta_, null, 2))
  writeFileSync(join(dir, 'transcript.txt'), transcript)
  return { ...meta_, workDir: dir }
}

// ---------- main ----------
await ensureBin()
mkdirSync(WORK, { recursive: true })

let ids
if (explicit.length) {
  ids = explicit.map(videoId)
} else {
  // Use the channel's "uploads" playlist (UU…) instead of the /videos tab:
  // it includes Shorts and lists every upload newest-first by date.
  const channelId = (yt([
    '--skip-download',
    '--playlist-items',
    '1',
    '--print',
    'channel_id',
    CHANNEL,
  ]).stdout.match(/UC[\w-]{22}/) || [])[0]
  if (!channelId) throw new Error('Could not resolve channel_id')
  const uploads = `UU${channelId.slice(2)}`

  const listing = yt([
    '--flat-playlist',
    '--print',
    '%(id)s',
    `https://www.youtube.com/playlist?list=${uploads}`,
  ])
  const all = listing.stdout
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => /^[\w-]{11}$/.test(s))
  const published = publishedVideoIds()
  ids = all.filter((id) => !published.has(id)).slice(0, limit)
  process.stderr.write(
    `Channel uploads (incl. Shorts): ${all.length} videos, ${published.size} already posted, processing ${ids.length}\n`,
  )
}

const done = []
for (const id of ids) {
  process.stderr.write(`Fetching ${id}...\n`)
  try {
    done.push(fetchVideo(id))
  } catch (e) {
    process.stderr.write(`  failed: ${e.message}\n`)
    done.push({ videoId: id, error: e.message })
  }
}

process.stdout.write(JSON.stringify({ processed: done }, null, 2) + '\n')
