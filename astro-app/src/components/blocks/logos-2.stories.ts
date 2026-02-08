import Logos2 from './logos-2.astro'

export default {
  title: 'Blocks/Logos/Logos2',
  component: Logos2,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  args: {
    logos: [
        {
            src: "https://placehold.co/120x40",
            alt: "Company A",
            text: "Company A",
            href: "#"
        },
        {
            src: "https://placehold.co/120x40",
            alt: "Company B",
            text: "Company B",
            href: "#"
        },
        {
            src: "https://placehold.co/120x40",
            alt: "Company C",
            text: "Company C",
            href: "#"
        },
        {
            src: "https://placehold.co/120x40",
            alt: "Company D",
            text: "Company D",
            href: "#"
        }
    ]
},
}
