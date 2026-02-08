import Input from './input.astro'

export default {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'select', options: ['text', 'email', 'tel'] },
  },
}

export const Text = {
  args: {
    type: 'text',
    placeholder: 'Enter your name...',
  },
}

export const Email = {
  args: {
    type: 'email',
    placeholder: 'you@example.com',
  },
}

export const Tel = {
  args: {
    type: 'tel',
    placeholder: '+1 (555) 000-0000',
  },
}
