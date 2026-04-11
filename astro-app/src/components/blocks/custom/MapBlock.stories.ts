import MapBlock from './MapBlock.astro'

const sharedContactInfo = {
  phone: '+1 (555) 123-4567',
  email: 'hello@example.com',
  hours: 'Mon–Fri: 9:00 AM – 5:00 PM\nSat: 10:00 AM – 2:00 PM\nSun: Closed',
}

export default {
  title: 'Components/MapBlock',
  component: MapBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Location map block with address display and contact info. Renders a styled placeholder — real map integration is a future concern.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'split', 'full-width'],
      description: 'Layout variant',
    },
    heading: { control: 'text', description: 'Section heading' },
    address: { control: 'text', description: 'Physical address' },
    caption: { control: 'text', description: 'Caption text below map' },
    backgroundVariant: {
      control: { type: 'select' },
      options: ['white', 'light', 'dark', 'primary', 'hatched', 'hatched-light'],
      description: 'Background color theme',
    },
    spacing: {
      control: { type: 'select' },
      options: ['none', 'small', 'default', 'large'],
      description: 'Vertical padding',
    },
    maxWidth: {
      control: { type: 'select' },
      options: ['narrow', 'default', 'full'],
      description: 'Maximum content width',
    },
  },
}

export const Default = {
  args: {
    _type: 'mapBlock',
    _key: 'story-map-default',
    variant: 'default',
    heading: 'Find Us',
    address: '123 Innovation Drive, Suite 400, San Francisco, CA 94105',
    coordinates: { lat: 37.7749, lng: -122.4194 },
    caption: 'Located in the heart of downtown San Francisco.',
  },
}

export const Split = {
  args: {
    _type: 'mapBlock',
    _key: 'story-map-split',
    variant: 'split',
    heading: 'Visit Our Office',
    address: '456 Market Street, Floor 12, New York, NY 10001',
    coordinates: { lat: 40.7128, lng: -74.006 },
    contactInfo: sharedContactInfo,
  },
}

export const FullWidth = {
  args: {
    _type: 'mapBlock',
    _key: 'story-map-full-width',
    variant: 'full-width',
    heading: 'Our Location',
    address: '789 Tech Park Boulevard, Austin, TX 78701',
    coordinates: { lat: 30.2672, lng: -97.7431 },
    caption: 'Conveniently located near downtown Austin.',
  },
}
