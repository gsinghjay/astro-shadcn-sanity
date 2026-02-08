import Contact1 from './contact-1.astro'

export default {
  title: 'Blocks/Contact/Contact1',
  component: Contact1,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  args: {
    items: [
        {
            icon: "mail",
            title: "Email Us",
            description: "hello@example.com",
            href: "mailto:hello@example.com"
        },
        {
            icon: "phone",
            title: "Call Us",
            description: "+1 (555) 000-0000",
            href: "tel:+15550000000"
        },
        {
            icon: "map-pin",
            title: "Visit Us",
            description: "123 Main St, City, State"
        }
    ],
    form: {
        fields: [
            {
                type: "text",
                label: "Name",
                placeholder: "Your name"
            },
            {
                type: "email",
                label: "Email",
                placeholder: "you@example.com"
            },
            {
                type: "textarea",
                label: "Message",
                placeholder: "How can we help?"
            }
        ],
        submit: "Send Message"
    }
},
}
