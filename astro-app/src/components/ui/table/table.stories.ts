import TableStory from './TableStory.astro'

export default {
  title: 'UI/Table',
  component: TableStory,
  tags: ['autodocs'],
}

export const Default = {
  args: {
    rows: [
      { team: 'Team Alpha', sponsor: 'Prudential', members: 5, status: 'Active' },
      { team: 'Team Beta', sponsor: 'ADP', members: 4, status: 'Active' },
      { team: 'Team Gamma', sponsor: 'Verizon', members: 5, status: 'Planning' },
      { team: 'Team Delta', sponsor: 'Panasonic', members: 4, status: 'Completed' },
    ],
  },
}

export const WithCaption = {
  args: {
    caption: 'Spring 2027 Capstone Teams',
    rows: [
      { team: 'Team Alpha', sponsor: 'Prudential', members: 5, status: 'Active' },
      { team: 'Team Beta', sponsor: 'ADP', members: 4, status: 'Active' },
    ],
  },
}
