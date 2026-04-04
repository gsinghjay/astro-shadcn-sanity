import ProductShowcase from './ProductShowcase.astro'

const sharedProducts = [
  {
    _key: 'prod-1',
    title: 'Wireless Headphones Pro',
    description: 'Premium noise-canceling headphones with 40-hour battery life and spatial audio support.',
    price: '$299',
    badge: 'New',
    link: '/products/headphones',
    image: { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop', alt: 'Headphones' },
  },
  {
    _key: 'prod-2',
    title: 'Smart Watch Ultra',
    description: 'Advanced health monitoring with GPS, water resistance, and 7-day battery life.',
    price: '$449',
    link: '/products/watch',
    image: { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop', alt: 'Watch' },
  },
  {
    _key: 'prod-3',
    title: 'Portable Speaker',
    description: 'Rugged Bluetooth speaker with 360-degree sound and 20-hour playtime.',
    price: '$149',
    badge: 'Best Seller',
    link: '/products/speaker',
    image: { url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=400&fit=crop', alt: 'Speaker' },
  },
  {
    _key: 'prod-4',
    title: 'Mechanical Keyboard',
    description: 'Tactile switches with per-key RGB lighting and programmable macros.',
    price: '$179',
    link: '/products/keyboard',
    image: { url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=400&fit=crop', alt: 'Keyboard' },
  },
]

export default {
  title: 'Components/ProductShowcase',
  component: ProductShowcase,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Product showcase block with grid, featured, and detail layouts for displaying products or catalog items.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['grid', 'featured', 'detail'],
      description: 'Layout variant',
    },
    heading: { control: 'text', description: 'Section heading' },
    description: { control: 'text', description: 'Section description' },
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

export const Grid = {
  args: {
    _type: 'productShowcase',
    _key: 'story-products-grid',
    variant: 'grid',
    heading: 'Featured Products',
    description: 'Discover our latest collection of premium tech accessories.',
    products: sharedProducts,
  },
}

export const Featured = {
  args: {
    _type: 'productShowcase',
    _key: 'story-products-featured',
    variant: 'featured',
    heading: 'Our Top Picks',
    description: 'Hand-selected favorites from our catalog.',
    products: sharedProducts.slice(0, 3),
  },
}

export const Detail = {
  args: {
    _type: 'productShowcase',
    _key: 'story-products-detail',
    variant: 'detail',
    heading: 'Browse All Products',
    description: 'Explore the full lineup.',
    products: sharedProducts,
  },
}
