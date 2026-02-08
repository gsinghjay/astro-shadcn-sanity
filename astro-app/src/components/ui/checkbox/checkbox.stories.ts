import Checkbox from './checkbox.astro'

export default {
  title: 'UI/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
}

export const Default = {
  args: {},
}

export const Checked = {
  args: {
    checked: true,
  },
}

export const Disabled = {
  args: {
    disabled: true,
  },
}
