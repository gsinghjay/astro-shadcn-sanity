import Article2 from './article-2.astro'

export default {
  title: 'Blocks/Articles/Article2',
  component: Article2,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  args: {
    title: "Section Title",
    description: "A short description that explains the value proposition of this section.",
    image: {
        src: "https://placehold.co/800x400",
        alt: "Placeholder image"
    },
    item: {
        image: {
            src: "https://placehold.co/40x40",
            alt: "Author"
        },
        title: "John Doe",
        description: "Technical Writer"
    }
},
}
