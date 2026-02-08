import TableStory from './TableStory.astro'

export default {
  title: 'UI/Table',
  component: TableStory,
  tags: ['autodocs'],
}

export const Default = {
  args: {
    rows: [
      { team: 'Team Alpha', sponsor: 'Acme Corp', members: 5, status: 'Active' },
      { team: 'Team Beta', sponsor: 'Ipsum Solutions', members: 4, status: 'Active' },
      { team: 'Team Gamma', sponsor: 'Dolor Tech', members: 5, status: 'Planning' },
      { team: 'Team Delta', sponsor: 'Sit Amet Inc', members: 4, status: 'Completed' },
    ],
  },
}

export const WithCaption = {
  args: {
    caption: 'Lorem Ipsum Teams',
    rows: [
      { team: 'Team Alpha', sponsor: 'Acme Corp', members: 5, status: 'Active' },
      { team: 'Team Beta', sponsor: 'Ipsum Solutions', members: 4, status: 'Active' },
    ],
  },
}
