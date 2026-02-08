import PriceStory from './PriceStory.astro'

export default {
  title: 'UI/Price',
  component: PriceStory,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'sale'] },
  },
}

export const Default = {
  args: {
    price: 99,
    currency: 'USD',
    unit: '/month',
    variant: 'default',
  },
}

export const Sale = {
  args: {
    price: 49,
    currency: 'USD',
    unit: '/month',
    variant: 'sale',
  },
}

export const Yearly = {
  args: {
    price: 999,
    currency: 'USD',
    unit: '/year',
    variant: 'default',
  },
}
