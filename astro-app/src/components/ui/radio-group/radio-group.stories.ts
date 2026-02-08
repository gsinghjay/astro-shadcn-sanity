import RadioGroupStory from './RadioGroupStory.astro'

export default {
  title: 'UI/RadioGroup',
  component: RadioGroupStory,
  tags: ['autodocs'],
}

export const Default = {
  args: {
    options: [
      { value: 'platinum', label: 'Platinum' },
      { value: 'gold', label: 'Gold' },
      { value: 'silver', label: 'Silver' },
    ],
    name: 'tier',
  },
}

export const ProjectTypes = {
  args: {
    options: [
      { value: 'web', label: 'Web Application' },
      { value: 'mobile', label: 'Mobile App' },
      { value: 'data', label: 'Data Analytics' },
      { value: 'tool', label: 'Internal Tool' },
    ],
    name: 'project-type',
  },
}
