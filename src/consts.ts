import type { IconMap, SocialLink, Site } from '@/types'

export const SITE: Site = {
  title: 'Piero Savastano',
  description:
    'Started as a young research scientist specialized on computational neuroscience, cognitive psychology, artificial life and artificial intelligence. Ended up creating videos, maintaining an AI open source framework and consulting internationally on AI.',
  href: 'https://pieroit.org',
  author: 'pieroit',
  locale: 'en-US',
  featuredPostCount: 3,
  postsPerPage: 5,
}

// Google Form inquiry links, one per service so notifications are self-tagging.
export const CONTACT_FORMS = {
  speaking: 'https://forms.gle/Cmttgx5wKD83i4HB7',
  training: 'https://forms.gle/5KWrUuQJniJZsQuu5',
}

export const NAV_LINKS: SocialLink[] = [
  {
    href: '/speaking',
    label: 'Public Speaking',
  },
  {
    href: '/training',
    label: 'Training',
  },
  {
    href: '/blog',
    label: 'blog',
  },
  /*{
    href: '/about',
    label: 'about',
  },*/
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: 'https://www.youtube.com/@PieroSavastano',
    label: 'YouTube',
  },
  {
    href: 'https://www.tiktok.com/@piero.savastano',
    label: 'TikTok',
  },
  {
    href: 'https://www.linkedin.com/in/piero-savastano-523b3016/',
    label: 'LinkedIn',
  },
  {
    href: 'https://github.com/pieroit',
    label: 'GitHub',
  },
  {
    href: 'mailto:piero.savastano@gmail.com',
    label: 'Email',
  },
  /*{
    href: '/rss.xml',
    label: 'RSS',
  },*/
]

export const ICON_MAP: IconMap = {
  Website: 'lucide:globe',
  GitHub: 'lucide:github',
  LinkedIn: 'lucide:linkedin',
  YouTube: 'lucide:youtube',
  TikTok: 'lucide:square-play',
  Twitter: 'lucide:twitter',
  Email: 'lucide:mail',
  RSS: 'lucide:rss',
}
