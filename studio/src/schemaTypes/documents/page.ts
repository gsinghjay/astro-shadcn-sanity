import {defineType, defineField, defineArrayMember} from 'sanity'
import type {SanityDocument} from 'sanity'
import {DocumentIcon} from '@sanity/icons'
import {siteField} from '../fields/site-field'

/**
 * Block types that may not render well in constrained-column templates.
 * Value arrays list which templates trigger a warning.
 */
export const wideBlockWarnings: Record<string, string[]> = {
  heroBanner: ['sidebar', 'twoColumn'],
  statsRow: ['sidebar'],
  logoCloud: ['sidebar'],
  sponsorCards: ['sidebar'],
}

/**
 * Validate block/template compatibility. Returns true if all blocks are compatible,
 * or a warning object listing incompatible blocks.
 */
export function validateBlockTemplateCompatibility(
  blocks: Array<{_type: string}> | undefined | null,
  template: string | undefined | null,
): true | {message: string; level: 'warning'} {
  if (!blocks || !Array.isArray(blocks)) return true
  if (!template) return true

  const warnings: string[] = []
  for (const block of blocks) {
    const blockType = block._type
    const warnTemplates = wideBlockWarnings[blockType]
    if (warnTemplates?.includes(template)) {
      warnings.push(`"${blockType}" may not render well in the "${template}" template`)
    }
  }
  return warnings.length > 0 ? {message: warnings.join('; '), level: 'warning'} : true
}

export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentIcon,
  preview: {
    select: {title: 'title', subtitle: 'slug.current'},
  },
  groups: [
    {name: 'layout', title: 'Layout', default: true},
    {name: 'content', title: 'Content'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'layout',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'layout',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    {...siteField, group: 'layout'},
    defineField({
      name: 'template',
      title: 'Page Template',
      type: 'string',
      group: 'layout',
      initialValue: 'default',
      options: {
        list: [
          {title: 'Default', value: 'default'},
          {title: 'Full Width', value: 'fullWidth'},
          {title: 'Landing Page', value: 'landing'},
          {title: 'Sidebar', value: 'sidebar'},
          {title: 'Two Column', value: 'twoColumn'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'seo',
    }),
    defineField({
      name: 'blocks',
      title: 'Page Blocks',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({type: 'heroBanner'}),
        defineArrayMember({type: 'featureGrid'}),
        defineArrayMember({type: 'sponsorCards'}),
        defineArrayMember({type: 'richText'}),
        defineArrayMember({type: 'ctaBanner'}),
        defineArrayMember({type: 'faqSection'}),
        defineArrayMember({type: 'contactForm'}),
        defineArrayMember({type: 'logoCloud'}),
        defineArrayMember({type: 'statsRow'}),
        defineArrayMember({type: 'sponsorSteps'}),
        defineArrayMember({type: 'textWithImage'}),
        defineArrayMember({type: 'testimonials'}),
        defineArrayMember({type: 'eventList'}),
      ],
      validation: (Rule) =>
        Rule.custom((blocks, context) => {
          const doc = context.document as SanityDocument & {template?: string}
          return validateBlockTemplateCompatibility(
            blocks as Array<{_type: string}>,
            doc?.template,
          )
        }),
      options: {
        insertMenu: {
          filter: true,
          groups: [
            {name: 'heroes', title: 'Heroes', of: ['heroBanner']},
            {
              name: 'content',
              title: 'Content',
              of: ['richText', 'textWithImage', 'faqSection'],
            },
            {
              name: 'media',
              title: 'Media & Stats',
              of: ['statsRow', 'featureGrid'],
            },
            {name: 'social', title: 'Social Proof', of: ['sponsorCards', 'logoCloud', 'sponsorSteps', 'testimonials', 'eventList']},
            {name: 'cta', title: 'Calls to Action', of: ['ctaBanner', 'contactForm']},
          ],
          views: [
            {name: 'list'},
            {name: 'grid', previewImageUrl: (type: string) => `/static/block-previews/${type}.png`},
          ],
        },
      },
    }),
  ],
})
