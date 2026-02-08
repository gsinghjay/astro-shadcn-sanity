import TabsStory from './TabsStory.astro'

export default {
  title: 'UI/Tabs',
  component: TabsStory,
  tags: ['autodocs'],
}

export const Default = {
  args: {
    tabs: [
      { value: 'tab-one', label: 'Tab One', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.' },
      { value: 'tab-two', label: 'Tab Two', content: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.' },
      { value: 'tab-three', label: 'Tab Three', content: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.' },
    ],
    defaultValue: 'tab-one',
  },
}

export const TwoTabs = {
  args: {
    tabs: [
      { value: 'tab-one', label: 'Tab One', content: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque.' },
      { value: 'tab-two', label: 'Tab Two', content: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.' },
    ],
    defaultValue: 'tab-one',
  },
}
