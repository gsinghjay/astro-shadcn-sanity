import CalendarBrutalistThemeStory from './CalendarBrutalistThemeStory.astro'

export default {
  title: 'Components/CalendarBrutalist',
  component: CalendarBrutalistThemeStory,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Swiss Brutalist theme overrides for Schedule-X calendar. No rounded corners, no shadows, no gradients. Hard 1px borders, uppercase headers, monospace time column, Swiss red (#E30613) accent.',
      },
    },
  },
  argTypes: {
    dark: {
      control: 'boolean',
      description: 'Toggle dark mode (applies `.dark` class)',
    },
  },
}

export const Light = {
  args: {
    dark: false,
  },
}

export const Dark = {
  args: {
    dark: true,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
}
