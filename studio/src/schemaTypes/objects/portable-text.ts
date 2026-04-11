import {defineType, defineField, defineArrayMember} from 'sanity'

export const portableText = defineType({
  name: 'portableText',
  title: 'Rich Text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'H2', value: 'h2'},
        {title: 'H3', value: 'h3'},
        {title: 'H4', value: 'h4'},
        {title: 'Quote', value: 'blockquote'},
      ],
      marks: {
        decorators: [
          {title: 'Bold', value: 'strong'},
          {title: 'Italic', value: 'em'},
          {title: 'Code', value: 'code'},
          {title: 'Underline', value: 'underline'},
        ],
        annotations: [
          defineArrayMember({
            name: 'link',
            type: 'object',
            title: 'External Link',
            fields: [
              defineField({
                name: 'href',
                type: 'url',
                title: 'URL',
                validation: (Rule) =>
                  Rule.uri({scheme: ['http', 'https', 'mailto', 'tel']}),
              }),
            ],
          }),
          defineArrayMember({
            name: 'internalLink',
            type: 'object',
            title: 'Internal Link',
            fields: [
              defineField({
                name: 'reference',
                type: 'reference',
                title: 'Reference',
                to: [{type: 'page'}, {type: 'sponsor'}, {type: 'project'}, {type: 'event'}, {type: 'article'}],
              }),
            ],
          }),
        ],
      },
      lists: [
        {title: 'Bullet', value: 'bullet'},
        {title: 'Numbered', value: 'number'},
      ],
    }),
    defineArrayMember({
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          description: 'Required for accessibility (NFR16)',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'caption',
          type: 'string',
          title: 'Caption',
        }),
      ],
    }),
    defineArrayMember({type: 'videoEmbed'}),
    defineArrayMember({
      name: 'callout',
      type: 'object',
      title: 'Callout Box',
      fields: [
        defineField({
          name: 'tone',
          type: 'string',
          title: 'Tone',
          options: {list: ['info', 'warning', 'success']},
          initialValue: 'info',
        }),
        defineField({
          name: 'text',
          type: 'text',
          title: 'Text',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineArrayMember({
      name: 'table',
      type: 'object',
      title: 'Table',
      fields: [
        defineField({
          name: 'caption',
          type: 'string',
          title: 'Caption (optional)',
          description: 'Short description rendered above the table',
        }),
        defineField({
          name: 'rows',
          type: 'array',
          title: 'Rows',
          of: [
            defineArrayMember({
              name: 'tableRow',
              type: 'object',
              fields: [
                defineField({
                  name: 'isHeader',
                  type: 'boolean',
                  title: 'Header row',
                  description: 'Toggle on for column headers',
                  initialValue: false,
                }),
                defineField({
                  name: 'cells',
                  type: 'array',
                  title: 'Cells',
                  of: [{type: 'string'}],
                  validation: (Rule) => Rule.min(1),
                }),
              ],
              preview: {
                select: {cells: 'cells', isHeader: 'isHeader'},
                prepare({cells, isHeader}) {
                  return {
                    title: (cells || []).join(' | ') || '(empty row)',
                    subtitle: isHeader ? 'Header row' : undefined,
                  }
                },
              },
            }),
          ],
          validation: (Rule) => Rule.min(1),
        }),
      ],
      preview: {
        select: {rows: 'rows', caption: 'caption'},
        prepare({rows, caption}) {
          return {
            title: caption || 'Table',
            subtitle: `${(rows || []).length} rows`,
          }
        },
      },
    }),
  ],
})
