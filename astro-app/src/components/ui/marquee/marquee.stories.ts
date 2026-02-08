import MarqueeStory from './MarqueeStory.astro'

export default {
  title: 'UI/Marquee',
  component: MarqueeStory,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    direction: { control: 'select', options: ['left', 'right'] },
    pauseOnHover: { control: 'boolean' },
  },
}

export const ScrollLeft = {
  args: {
    items: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'PostgreSQL', 'Astro'],
    direction: 'left',
    pauseOnHover: false,
  },
}

export const ScrollRight = {
  args: {
    items: ['Prudential', 'ADP', 'Verizon', 'Panasonic', 'BD', 'Cognizant'],
    direction: 'right',
    pauseOnHover: false,
  },
}

export const PauseOnHover = {
  args: {
    items: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'PostgreSQL', 'Astro'],
    direction: 'left',
    pauseOnHover: true,
  },
}
