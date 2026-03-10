import HeroBanner from './HeroBanner.astro'

const sharedImages = [
  {
    _key: 'img-1',
    asset: {
      _ref: 'image-117be8afe69ff441c417bb9de6e457e82848aaf4-5712x4284-jpg',
      _type: 'reference' as const,
      metadata: {
        lqip: 'data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAPABQDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQAG/8QAIhAAAQMFAAEFAAAAAAAAAAAAAgEDBAAFBhEhExIUIkFh/8QAFgEBAQEAAAAAAAAAAAAAAAAAAwIE/8QAHREAAgIBBQAAAAAAAAAAAAAAAQIAEQMEEiExQf/aAAwDAQACEQMRAD8AeHJBul/my4bihBaFBJs14g/a0U/k4OOHOtvxQk9GyTek33tYLAzeM5zk11QgkKg6g9IvxKTyN4bNizLkUl9lMcURbUejqjobgvkcWqFwOaMeiZBdmQMWHGXm1JSEnC72qsFb5XljIXlUdLrWlqq20uEmzMgy5K6n/9k=',
      },
    },
    alt: 'Hero background slide 1',
  },
  {
    _key: 'img-2',
    asset: {
      _ref: 'image-2a6401c1446d28831232afe928a2eb5eca445ee5-1024x1024-png',
      _type: 'reference' as const,
      metadata: {
        lqip: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAFb0lEQVR4nDWRWUzbhwHG/8/TJnWKtmmbWvWhW3dlmjRN27R06RKWpGk2BXI1TUJLKaTk5EqAAOEwIRcLR8AcgQKhEAM2V/ABBttgbHwQ38ZgwBhwgISEFAgJ7ctvqqc9/KTv4adPn/QJPfeL6awvoud+CSqJmL7Wqv8hqaT3q7soWipQt9egltYwIK2hv70aRXMF8uZyVK1VYZQSMfKWcroaixEm7EOYtN3YDEpmPEaCE5YwUy4DNoMKt2WAWZ+ZuUkr85NjzHhNOIx92Ef7mPaMht3ZCUs4u8xqhNVn8/jcJgJ+O+svHvP65ZMwL1bmCEzaCAW9bG4ss/VqhW9ePQs7wSknwWkX118vsrW5wtbmU16uLbI070NYX1vCPz4WFjY3nvDt6+d88/o5a6shApN2FoJeNtaXWPt6kReri6w+CxHwOwjOuNlYW2ZzY4WNtSesvVhk8f+Fk14rM34HL9eX+XbrOVuvnvF0eRaXw4zPa2Nuzo/bY8Nut+L3e/A4rXhdVh6HpllamiMUCrK0GGA+4Eb4rtlmGWJEI2ch4GF1JUhw2o3LaWVo1ITZ7sLtm8Ric2C02rC53JhtdowWK3anjemZCYJz08zPTzHrdyCE5qZQdrdRV3qTUXU3LpMGeWsjqt4udBYHNv88U3OL+IOPmQiEsDjG6VTp6O4fZtgwisfrZDbgY2HGzZTTgGDQD3GvvJSKwlz6pU1IG6vDWdbShMH8iPGpOYILywQfPyUYWkavN3LnP6WIq+pRa7S43I8ITDlZGDfjM6oQJE2NpCUncz0nm+a6Sq6kJpMQG0vRzVvIpJ0YR0x4JmaY/G7hdABtn4pSUQ4l1wvpkEkZHh7EahzApVdgU8sQGipL+ejoMaJPnCQ3LZXDByPZs2sPF86cpapCjFKpwmh1YHF6MY2aULa30HArl8prWdwuyCPvahairDSK8zNprSlGqK8s5cO9H7Dn7ztJ/OwURw98yP5du7mamoi0uZ4RbR9jJj3GIQ3avl4679dQdjWV2+kXuJQQx8G9+9i3YwdHPtiLKCMJoagwjwMREUTt3oko8TTZ5+OJP3mckuu5aOUSPGY1QZcB14gKg7qL9qYaEj6L5lzMSa6lpxJ77DiHdkfwadRBrmVdQjgUFcX7f9vB4X0RiJJOIxalU5CWiLhIRJ+sHveokmW/hVnHMHa9gtZGMac+OsKJQ1GIMtJJOnuRhJh4Mi4mUpB9BeGtt9/lnV/+jr/86a+cjPw3BclfUJGbyr0bmbSJb2CUP2DBa2LBN8a4eRCl5B6FaRdI+vwTkhISSIg/x+XUTPIyc0g5fx7hB2/8lG0/eZufvfkLtv9mOx/v/ydFSbE0FKQgKcllqKOByTEdMy4TPosGo0JCV10JlfmXyTobz9m4BNIuZZF5+Qpxn8YgfO/7P+aH237Om2+9w+9/u53j+yO4c+k0zbcy6Kq6gVnZxrhJg8+iw6VXopPW0VYmojr7IvlnYjgfE8O5+C9IiI3jSGQUwrY3fsQffvUuRw/sJfn0J5TlXaa98iatJTl03M3D1NuCx6jGY9LwaKALee1tavOTqM5PpTwnhcLUM6TFnSI68gD/eG8nwp4//prEw7uoFSXysP4OOmkthq56lPeu01OahbHjy/DD7tFBbAOdDH5VhrRchLypAl13M4qWKuoKUsiI/heR7/8ZoeziMRrSTyAvS2NUVoWzT4JH047tYT1GSTk2RTOeYTluvQKXpgPrwwa0DyrQtNWgf9jMoLQOWWk2tenRFMbuR9B9WYCiOIX+iiuMdVYzoevAP9LDxFAnnoE2vFoZvuEexnXdeAeluPsfYOttxNhRi1YiRn2/GMXdTGSieFqvRvNfV7aZ2StHNkEAAAAASUVORK5CYII=',
      },
    },
    alt: 'Hero background slide 2',
  },
]

const sharedButtons = [
  { _key: 'btn-1', text: 'Get Started', url: '/about' },
  { _key: 'btn-2', text: 'Contact Us', url: '/contact', variant: 'outline' },
]

export default {
  title: 'Blocks/HeroBanner',
  component: HeroBanner,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  args: {
    _type: 'heroBanner',
    _key: 'story-hero-1',
    variant: 'centered',
    heading: 'Lorem Ipsum Dolor Sit',
    subheading: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
    alignment: 'center',
    ctaButtons: sharedButtons,
  },
}

export const Centered = {
  args: {
    _type: 'heroBanner',
    _key: 'story-hero-centered',
    variant: 'centered',
    heading: 'Centered Hero with Carousel',
    subheading: 'Glass card content over background carousel — the default layout',
    alignment: 'center',
    ctaButtons: sharedButtons,
    backgroundImages: sharedImages,
  },
}

export const Overlay = {
  args: {
    _type: 'heroBanner',
    _key: 'story-hero-overlay',
    variant: 'overlay',
    heading: 'Overlay Hero',
    subheading: 'Text directly over darkened background — no glass card',
    alignment: 'center',
    ctaButtons: sharedButtons,
    backgroundImages: sharedImages,
  },
}

export const Split = {
  args: {
    _type: 'heroBanner',
    _key: 'story-hero-split',
    variant: 'split',
    heading: 'Split Hero Layout',
    subheading: 'Text and buttons on the left, single image on the right',
    ctaButtons: sharedButtons,
    backgroundImages: sharedImages,
  },
}

export const SplitAsymmetric = {
  args: {
    _type: 'heroBanner',
    _key: 'story-hero-split-asym',
    variant: 'split-asymmetric',
    heading: 'Asymmetric Split',
    subheading: 'Smaller text column, larger image column (2fr:3fr)',
    ctaButtons: sharedButtons,
    backgroundImages: sharedImages,
  },
}

export const Spread = {
  args: {
    _type: 'heroBanner',
    _key: 'story-hero-spread',
    variant: 'spread',
    heading: 'Spread Hero Layout',
    subheading: 'Content spread with background image',
    ctaButtons: sharedButtons,
    backgroundImages: sharedImages,
  },
}

export const SplitBleed = {
  args: {
    _type: 'heroBanner',
    _key: 'story-hero-split-bleed',
    variant: 'split-bleed',
    heading: 'Split Bleed Hero',
    subheading: 'Compact text left, edge-to-edge image right (1fr:3fr)',
    ctaButtons: sharedButtons,
    backgroundImages: sharedImages,
  },
}

export const Minimal = {
  args: {
    _type: 'heroBanner',
    _key: 'story-hero-3',
    heading: 'Amet Consectetur',
    alignment: 'full',
  },
}
