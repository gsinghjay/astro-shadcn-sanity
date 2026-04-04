import CountdownTimer from './CountdownTimer.astro'

export default {
  title: 'Components/CountdownTimer',
  component: CountdownTimer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Countdown timer block with static placeholder digits. Client-side countdown JS is a future enhancement.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['inline', 'hero', 'banner'],
      description: 'Display variant',
    },
    heading: { control: 'text', description: 'Section heading' },
    description: { control: 'text', description: 'Section description' },
    targetDate: { control: 'text', description: 'Target date in ISO format' },
    completedMessage: { control: 'text', description: 'Message shown when countdown ends' },
    backgroundVariant: {
      control: { type: 'select' },
      options: ['white', 'light', 'dark', 'primary', 'hatched', 'hatched-light'],
      description: 'Background color theme',
    },
    spacing: {
      control: { type: 'select' },
      options: ['none', 'small', 'default', 'large'],
      description: 'Vertical padding',
    },
    maxWidth: {
      control: { type: 'select' },
      options: ['narrow', 'default', 'full'],
      description: 'Maximum content width',
    },
  },
}

export const Inline = {
  args: {
    _type: 'countdownTimer',
    _key: 'story-countdown-inline',
    variant: 'inline',
    heading: 'Event Starts In',
    description: 'Mark your calendar and prepare for something special.',
    targetDate: '2026-12-31T00:00:00Z',
  },
}

export const Hero = {
  args: {
    _type: 'countdownTimer',
    _key: 'story-countdown-hero',
    variant: 'hero',
    heading: 'Launch Day',
    description: 'The wait is almost over. Get ready for what comes next.',
    targetDate: '2026-06-15T09:00:00Z',
    backgroundVariant: 'dark',
  },
}

export const Banner = {
  args: {
    _type: 'countdownTimer',
    _key: 'story-countdown-banner',
    variant: 'banner',
    heading: 'Sale ends in:',
    targetDate: '2026-05-01T23:59:59Z',
    backgroundVariant: 'primary',
  },
}
