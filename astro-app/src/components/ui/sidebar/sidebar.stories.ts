import SidebarStory from './SidebarStory.astro'

export default {
  title: 'UI/Sidebar',
  component: SidebarStory,
  tags: ['autodocs'],
}

export const Default = {
  args: {
    showSubMenu: true,
  },
}

export const FlatMenu = {
  args: {
    showSubMenu: false,
  },
}
