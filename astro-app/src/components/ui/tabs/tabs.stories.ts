import TabsStory from './TabsStory.astro'

export default {
  title: 'UI/Tabs',
  component: TabsStory,
  tags: ['autodocs'],
}

export const Default = {
  args: {
    tabs: [
      { value: 'overview', label: 'Overview', content: 'The YWCC Capstone program pairs students with industry sponsors to deliver production-quality software.' },
      { value: 'requirements', label: 'Requirements', content: 'Students must have completed core CS coursework including data structures and algorithms.' },
      { value: 'timeline', label: 'Timeline', content: 'The program runs for one full academic semester, typically 15 weeks.' },
    ],
    defaultValue: 'overview',
  },
}

export const TwoTabs = {
  args: {
    tabs: [
      { value: 'students', label: 'For Students', content: 'Gain real-world experience by working on production applications with industry mentors.' },
      { value: 'sponsors', label: 'For Sponsors', content: 'Access emerging talent and get fresh perspectives on your business challenges.' },
    ],
    defaultValue: 'students',
  },
}
