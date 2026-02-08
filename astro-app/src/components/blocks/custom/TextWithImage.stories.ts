import TextWithImage from './TextWithImage.astro'

export default {
  title: 'Blocks/TextWithImage',
  component: TextWithImage,
  tags: ['autodocs'],
}

export const ImageRight = {
  args: {
    block: {
      _type: 'textWithImage',
      _key: 'story-twi-1',
      label: 'About the Program',
      headline: 'Real-World Experience for Tomorrow\'s Engineers',
      body: 'Our capstone program connects students with industry sponsors to solve meaningful technical challenges. Teams work in agile sprints, delivering production-quality software over a full semester.',
      imageUrl: 'https://placehold.co/800x600/e2e8f0/475569?text=Students+Collaborating',
      imagePosition: 'right',
      ctaText: 'Learn More',
      ctaUrl: '/about',
    },
  },
}

export const ImageLeft = {
  args: {
    block: {
      _type: 'textWithImage',
      _key: 'story-twi-2',
      label: 'Our Impact',
      headline: 'Building the Next Generation of Tech Leaders',
      body: 'Since 2018, our program has paired over 200 students with industry partners, delivering 50+ production applications across web, mobile, and data platforms.',
      imageUrl: 'https://placehold.co/800x600/e2e8f0/475569?text=Demo+Day',
      imagePosition: 'left',
      ctaText: 'See Projects',
      ctaUrl: '/projects',
    },
  },
}

export const Minimal = {
  args: {
    block: {
      _type: 'textWithImage',
      _key: 'story-twi-3',
      headline: 'Hands-On Learning',
      body: 'Students gain practical experience by working on real business problems with modern technology stacks.',
      imageUrl: 'https://placehold.co/800x600/e2e8f0/475569?text=Workshop',
    },
  },
}
