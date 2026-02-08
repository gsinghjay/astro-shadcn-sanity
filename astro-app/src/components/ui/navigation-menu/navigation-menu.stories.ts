import NavigationMenuStory from './NavigationMenuStory.astro'

export default {
  title: 'UI/NavigationMenu',
  component: NavigationMenuStory,
  tags: ['autodocs'],
}

export const WithDropdown = {
  args: {
    showDropdown: true,
  },
}

export const LinksOnly = {
  args: {
    showDropdown: false,
  },
}
