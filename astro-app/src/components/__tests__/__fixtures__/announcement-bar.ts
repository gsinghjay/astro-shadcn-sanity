import type { AnnouncementBarBlock } from '@/lib/types';

export const announcementInlineFull: AnnouncementBarBlock = {
  _type: 'announcementBar',
  _key: 'test-announce-1',
  backgroundVariant: 'primary',
  spacing: 'default',
  maxWidth: 'default',
  variant: 'inline',
  icon: 'info',
  text: 'Registration is now open for Spring 2026!',
  link: { label: 'Register Now', href: 'https://example.com/register' },
  dismissible: true,
};

export const announcementInlineMinimal: AnnouncementBarBlock = {
  _type: 'announcementBar',
  _key: 'test-announce-2',
  backgroundVariant: null,
  spacing: null,
  maxWidth: null,
  variant: 'inline',
  icon: null,
  text: 'Simple announcement',
  link: null,
  dismissible: null,
};

export const announcementFloating: AnnouncementBarBlock = {
  _type: 'announcementBar',
  _key: 'test-announce-3',
  backgroundVariant: null,
  spacing: 'default',
  maxWidth: 'default',
  variant: 'floating',
  icon: 'alert-triangle',
  text: 'Maintenance scheduled for this weekend',
  link: { label: 'Details', href: '/maintenance' },
  dismissible: null,
};

export const announcementMinimal: AnnouncementBarBlock = {
  _type: 'announcementBar',
  _key: 'test-announce-4',
  backgroundVariant: null,
  spacing: null,
  maxWidth: null,
  variant: null,
  icon: null,
  text: 'Basic announcement',
  link: null,
  dismissible: null,
};
