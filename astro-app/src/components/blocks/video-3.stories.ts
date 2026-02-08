import Video3 from './video-3.astro'

export default {
  title: 'Blocks/Video/Video3',
  component: Video3,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  args: {
    title: "Section Title",
    description: "A short description that explains the value proposition of this section.",
    links: [
        {
            text: "Get Started",
            href: "#"
        },
        {
            text: "Learn More",
            href: "#"
        }
    ],
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    images: [
        {
            src: "https://placehold.co/800x600",
            alt: "Image 1"
        },
        {
            src: "https://placehold.co/800x600",
            alt: "Image 2"
        },
        {
            src: "https://placehold.co/800x600",
            alt: "Image 3"
        }
    ]
},
}
