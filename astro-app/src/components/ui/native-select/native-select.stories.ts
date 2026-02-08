import NativeSelectStory from './NativeSelectStory.astro'

export default {
  title: 'UI/NativeSelect',
  component: NativeSelectStory,
  tags: ['autodocs'],
}

export const Default = {
  args: {
    options: ['Option A', 'Option B', 'Option C'],
    placeholder: 'Select an option',
  },
}

export const SponsorshipTiers = {
  args: {
    options: ['Platinum', 'Gold', 'Silver'],
    placeholder: 'Select a tier',
  },
}

export const ProjectTypes = {
  args: {
    options: ['Web Application', 'Mobile App', 'Data Analytics', 'Internal Tool'],
    placeholder: 'Select project type',
  },
}
