import {defineField} from 'sanity'
import {EarthGlobeIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

const ALLOWED_EMBED_HOSTS = [
  'youtube-nocookie.com',
  'youtube.com',
  'player.vimeo.com',
  'loom.com',
  'gist.github.com',
] as const

export const embedBlock = defineBlock({
  name: 'embedBlock',
  title: 'Embed Block',
  icon: EarthGlobeIcon,
  preview: {select: {title: 'heading'}},
  variants: [
    {name: 'default', title: 'Default'},
    {name: 'contained', title: 'Contained'},
    {name: 'full-width', title: 'Full Width'},
  ],
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.max(150)}),
    defineField({
      name: 'embedUrl',
      title: 'Embed URL',
      type: 'url',
      description:
        'Provider URL to embed. Allowed: YouTube, Vimeo, Google Maps (/maps/embed), Loom, GitHub Gist. Embeds run sandboxed; only known providers are allowed — other origins are rejected at render time.',
      validation: (Rule) =>
        Rule.uri({scheme: ['https'], allowRelative: false})
          .custom((value, context) => {
            const parent = context.parent as {rawEmbedCode?: string} | undefined
            if (!value && !parent?.rawEmbedCode) {
              return 'Either Embed URL or Raw Embed Code is required'
            }
            if (!value) return true
            try {
              const u = new URL(value)
              const host = u.hostname.replace(/^www\./, '')
              if (host === 'google.com' && u.pathname.startsWith('/maps/embed')) return true
              if ((ALLOWED_EMBED_HOSTS as readonly string[]).includes(host)) return true
              return `Embed URL must be from an allowed provider: ${ALLOWED_EMBED_HOSTS.join(', ')}, or Google Maps embed.`
            } catch {
              return 'Invalid URL'
            }
          }),
    }),
    defineField({
      name: 'rawEmbedCode',
      title: 'Raw Embed Code',
      type: 'text',
      rows: 8,
      description:
        'Raw HTML for embeds (e.g., third-party widgets). Renders inside a sandboxed iframe with no access to site cookies or DOM. Use only when no embedUrl is available, and only paste embed codes from trusted sources.',
    }),
    defineField({name: 'caption', title: 'Caption', type: 'string', description: 'Caption displayed below the embed', validation: (Rule) => Rule.max(200)}),
  ],
})
