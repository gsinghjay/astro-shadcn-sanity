import AnnouncementBar from './AnnouncementBar.astro'

export default {
  title: 'Components/AnnouncementBar',
  component: AnnouncementBar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Dismissible announcement banner. Supports inline (top-of-page) and floating (overlay) variants.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['inline', 'floating'],
      description: 'Layout variant',
    },
    text: { control: 'text', description: 'Announcement text' },
    dismissible: { control: 'boolean', description: 'Show dismiss button' },
  },
}

export const Inline = {
  args: {
    _type: 'announcementBar',
    _key: 'story-ab-inline',
    variant: 'inline',
    text: 'Registration for Spring 2026 is now open.',
    link: { label: 'Register Now', href: '/register' },
    dismissible: false,
    spacing: 'default',
    maxWidth: 'default',
  },
}

export const InlineWithIcon = {
  args: {
    _type: 'announcementBar',
    _key: 'story-ab-inline-icon',
    variant: 'inline',
    icon: 'info',
    text: 'Scheduled maintenance this Saturday from 2–4 AM EST.',
    link: { label: 'Details', href: '/status' },
    dismissible: true,
    spacing: 'default',
    maxWidth: 'default',
  },
}

export const InlineDismissible = {
  args: {
    _type: 'announcementBar',
    _key: 'story-ab-dismiss',
    variant: 'inline',
    text: 'New feature: Dark mode is now available across the site.',
    dismissible: true,
    spacing: 'default',
    maxWidth: 'default',
  },
}

export const Floating = {
  args: {
    _type: 'announcementBar',
    _key: 'story-ab-floating',
    variant: 'floating',
    icon: 'megaphone',
    text: 'We are hiring! Join our engineering team and help build the future.',
    link: { label: 'View Openings', href: '/careers' },
    spacing: 'default',
    maxWidth: 'default',
  },
}

export const FloatingMinimal = {
  args: {
    _type: 'announcementBar',
    _key: 'story-ab-floating-min',
    variant: 'floating',
    text: 'Site updated to version 3.0.',
    spacing: 'default',
    maxWidth: 'default',
  },
}
