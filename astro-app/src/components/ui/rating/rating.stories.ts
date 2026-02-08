import Rating from './rating.astro'

export default {
  title: 'UI/Rating',
  component: Rating,
  tags: ['autodocs'],
}

export const FiveStars = {
  args: { rating: 5 },
}

export const FourStars = {
  args: { rating: 4 },
}

export const ThreeAndHalf = {
  args: { rating: 3.5 },
}

export const OneStar = {
  args: { rating: 1 },
}
