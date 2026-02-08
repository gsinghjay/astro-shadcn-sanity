import Banner1 from './banner-1.astro'

export default {
  title: 'Blocks/Banner/Banner1',
  component: Banner1,
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
