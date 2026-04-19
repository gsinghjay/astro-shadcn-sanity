import EmbedBlock from './EmbedBlock.astro'

export default {
  title: 'Components/EmbedBlock',
  component: EmbedBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Embedded content block for iframes (videos, maps, forms) with responsive aspect ratio and optional caption.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'contained', 'full-width'],
      description: 'Width variant',
    },
    heading: { control: 'text', description: 'Section heading' },
    embedUrl: { control: 'text', description: 'URL to embed in iframe' },
    rawEmbedCode: { control: 'text', description: 'Raw HTML/script embed code (takes precedence over embedUrl)' },
    caption: { control: 'text', description: 'Caption text below embed' },
    backgroundVariant: {
      control: { type: 'select' },
      options: ['white', 'light', 'dark', 'primary', 'hatched', 'hatched-light'],
      description: 'Background color theme',
    },
    spacing: {
      control: { type: 'select' },
      options: ['none', 'small', 'default', 'large'],
      description: 'Vertical padding',
    },
    maxWidth: {
      control: { type: 'select' },
      options: ['narrow', 'default', 'full'],
      description: 'Maximum content width',
    },
  },
}

export const Default = {
  args: {
    _type: 'embedBlock',
    _key: 'story-embed-default',
    variant: 'default',
    heading: 'Watch the Demo',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    caption: 'A quick walkthrough of our platform features.',
  },
}

export const Contained = {
  args: {
    _type: 'embedBlock',
    _key: 'story-embed-contained',
    variant: 'contained',
    heading: 'Product Overview',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    caption: 'See how teams use our tools to ship faster.',
  },
}

export const FullWidth = {
  args: {
    _type: 'embedBlock',
    _key: 'story-embed-full-width',
    variant: 'full-width',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
}

export const RawEmbed = {
  args: {
    _type: 'embedBlock',
    _key: 'story-embed-raw',
    variant: 'contained',
    heading: 'Sign Up via Formsite',
    rawEmbedCode: `<a name="form124589233" id="formAnchor124589233"></a>
<script src="https://fs7.formsite.com/include/form/embedManager.js?124589233"></script>
<script>
EmbedManager.embed({
    key: "https://fs7.formsite.com/res/showFormEmbed?EParam=vIGmKZCQ4HrsL88tPos7OPQBLWIKfCumFzpUCZwnDno&124589233",
    width: "100%",
    showSaveAndReturn: "login"
});
</script>`,
    caption: 'Script-based embed rendered via set:html (no iframe).',
  },
}
