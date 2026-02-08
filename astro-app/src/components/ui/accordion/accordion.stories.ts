import AccordionStory from './AccordionStory.astro'

export default {
  title: 'UI/Accordion',
  component: AccordionStory,
  tags: ['autodocs'],
  argTypes: {
    items: { control: 'object' },
    openFirst: { control: 'boolean' },
  },
}

export const SingleItem = {
  args: {
    items: [
      { title: 'Is this an accordion?', content: 'Yes, this is a single accordion item.' },
    ],
    openFirst: false,
  },
}

export const MultipleItems = {
  args: {
    items: [
      { title: 'What is this project?', content: 'A capstone program connecting students with industry sponsors.' },
      { title: 'How do I get involved?', content: 'Contact us through the website or attend our info session.' },
      { title: 'When does the program run?', content: 'The program runs each semester from January to May and September to December.' },
    ],
    openFirst: true,
  },
}
