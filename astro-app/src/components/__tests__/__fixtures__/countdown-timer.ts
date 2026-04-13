import type { CountdownTimerBlock } from '@/lib/types';

const base = {
  _type: 'countdownTimer' as const,
  _key: 'test-countdown',
  backgroundVariant: null,
  spacing: 'default' as const,
  maxWidth: 'default' as const,
};

export const countdownInline: CountdownTimerBlock = {
  ...base,
  heading: 'Event Countdown',
  description: 'Time remaining until launch',
  targetDate: '2027-01-01T00:00:00Z',
  completedMessage: 'We have launched!',
  variant: 'inline',
};

export const countdownHero: CountdownTimerBlock = {
  ...base,
  _key: 'test-countdown-hero',
  heading: 'The Big Launch',
  description: 'Join us for the main event',
  targetDate: '2027-06-15T18:00:00Z',
  completedMessage: 'The event has begun!',
  variant: 'hero',
};

export const countdownBanner: CountdownTimerBlock = {
  ...base,
  _key: 'test-countdown-banner',
  heading: 'Sale Ends Soon',
  description: null,
  targetDate: '2027-03-01T00:00:00Z',
  completedMessage: null,
  variant: 'banner',
};

export const countdownBrutalist: CountdownTimerBlock = {
  ...base,
  _key: 'test-countdown-brutalist',
  heading: 'Deadline Approaching',
  description: 'Submit your entry before time runs out',
  targetDate: '2027-09-01T12:00:00Z',
  completedMessage: null,
  variant: 'brutalist',
};

export const countdownMinimal: CountdownTimerBlock = {
  ...base,
  _key: 'test-countdown-minimal',
  heading: null,
  description: null,
  targetDate: '2027-01-01T00:00:00Z',
  completedMessage: null,
  variant: null,
};
