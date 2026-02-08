import Banner2 from './banner-2.astro'

export default {
  title: 'Blocks/Banner/Banner2',
  component: Banner2,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  args: {
    title: "Important Announcement",
    description: "A short description that explains the value proposition of this section.",
    icon: "info"
},
}
