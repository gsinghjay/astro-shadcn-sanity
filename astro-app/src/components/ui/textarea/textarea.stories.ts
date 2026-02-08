import Textarea from './textarea.astro'

export default {
  title: 'UI/Textarea',
  component: Textarea,
  tags: ['autodocs'],
}

export const Default = {
  args: {
    placeholder: 'Type your message here...',
    rows: 4,
  },
}

export const Large = {
  args: {
    placeholder: 'Write a detailed description...',
    rows: 8,
  },
}
