import FieldStory from './FieldStory.astro'

export default {
  title: 'UI/Field',
  component: FieldStory,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'select', options: ['vertical', 'horizontal', 'responsive'] },
    inputType: { control: 'select', options: ['text', 'email', 'textarea'] },
  },
}

export const Default = {
  args: {
    label: 'Email Address',
    placeholder: 'you@example.com',
    inputType: 'email',
    orientation: 'vertical',
  },
}

export const WithDescription = {
  args: {
    label: 'Email Address',
    description: "We'll never share your email with anyone else.",
    placeholder: 'you@example.com',
    inputType: 'email',
    orientation: 'vertical',
  },
}

export const TextInput = {
  args: {
    label: 'Full Name',
    placeholder: 'John Doe',
    inputType: 'text',
    orientation: 'vertical',
  },
}

export const TextareaField = {
  args: {
    label: 'Message',
    placeholder: 'Type your message here...',
    inputType: 'textarea',
    orientation: 'vertical',
  },
}

export const Horizontal = {
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    inputType: 'email',
    orientation: 'horizontal',
  },
}
