import Steps1 from './steps-1.astro'

export default {
  title: 'Blocks/Steps/Steps1',
  component: Steps1,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  args: {
    links: [
        {
            text: "Get Started",
            href: "#"
        },
        {
            text: "Learn More",
            href: "#"
        }
    ],
    items: [
        {
            title: "Sign Up",
            description: "Create your account in seconds.",
            list: [
                "Free forever plan",
                "No credit card needed"
            ]
        },
        {
            title: "Configure",
            description: "Set up your workspace preferences.",
            list: [
                "Import existing data",
                "Invite your team"
            ]
        },
        {
            title: "Launch",
            description: "Start building and shipping.",
            list: [
                "Go live instantly",
                "Scale as you grow"
            ]
        }
    ]
},
}
