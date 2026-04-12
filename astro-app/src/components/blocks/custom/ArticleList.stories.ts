import type { Meta, StoryObj } from '@/lib/storybook-types';
import ArticleList from './ArticleList.astro';
import { storyArticles } from '@/components/__fixtures__/articles';

const sharedButtons = [
  { _key: 'btn-1', text: 'View All Articles', url: '/articles', variant: 'outline' },
];

const meta = {
  title: 'Blocks/Custom/ArticleList',
  component: ArticleList,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Article listing block with 5 variants: grid, split-featured, list, brutalist, magazine. Wires article documents from Sanity via resolveBlockArticles() in production; stories pass fixture data directly via the `articles` prop.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['grid', 'split-featured', 'list', 'brutalist', 'magazine'],
      description:
        'Layout variant (matches studio/src/schemaTypes/blocks/article-list.ts radio order)',
    },
    heading: { control: 'text', description: 'Section heading' },
    description: { control: 'text', description: 'Section description' },
    backgroundVariant: {
      control: { type: 'select' },
      options: ['white', 'light', 'dark', 'primary'],
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
} satisfies Meta<typeof ArticleList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Grid = {
  args: {
    _type: 'articleList',
    _key: 'story-al-grid',
    variant: 'grid',
    heading: 'Latest Articles',
    description: 'News and insights from our team on technology, design, and community.',
    contentType: 'all',
    limit: 6,
    ctaButtons: sharedButtons,
    articles: storyArticles,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Default 3-column responsive grid of `<ArticleCard>` instances. `data-variant="grid"` marker on the root Section.',
      },
    },
  },
} satisfies Story;

export const SplitFeatured = {
  args: {
    _type: 'articleList',
    _key: 'story-al-split',
    variant: 'split-featured',
    heading: 'From the Newsroom',
    description: 'Featured stories and recent posts.',
    contentType: 'all',
    limit: 4,
    ctaButtons: sharedButtons,
    articles: storyArticles,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Split layout with one featured ArticleCard on the left and a stacked list of thumbnail+headline rows on the right. `data-variant="split-featured"` marker on the root Section.',
      },
    },
  },
} satisfies Story;

export const List = {
  args: {
    _type: 'articleList',
    _key: 'story-al-list',
    variant: 'list',
    heading: 'Archive',
    contentType: 'all',
    limit: 10,
    ctaButtons: sharedButtons,
    articles: storyArticles,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Tight list layout — fixed-width date column on the left, headline + excerpt on the right, divider between rows. No featured images at this variant. `data-variant="list"` marker on the root Section.',
      },
    },
  },
} satisfies Story;

export const Brutalist = {
  args: {
    _type: 'articleList',
    _key: 'story-al-brutalist',
    variant: 'brutalist',
    heading: 'Dispatches',
    description: 'Field reports from the edge of the web.',
    contentType: 'all',
    limit: 6,
    ctaButtons: sharedButtons,
    articles: storyArticles,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Brutalist variant — `border-brutal border-foreground` frames, `label-caps` category tags, `font-mono tabular-nums` metadata, `border-l-4 border-primary pl-6` heading treatment. Uses inline card markup (not `<ArticleCard>`) so the `label-caps` category style applies. `data-variant="brutalist"` marker on the root Section.',
      },
    },
  },
} satisfies Story;

export const Magazine = {
  args: {
    _type: 'articleList',
    _key: 'story-al-magazine',
    variant: 'magazine',
    heading: 'The Long Read',
    description: 'Editor-picked features.',
    contentType: 'all',
    limit: 6,
    ctaButtons: sharedButtons,
    articles: storyArticles,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Editorial magazine layout — 1600×900 hero for the first article (eager-loaded, fetchpriority=high), remaining articles in a 3-column responsive grid of `<ArticleCard>` instances. `data-variant="magazine"` marker on the root Section.',
      },
    },
  },
} satisfies Story;

export const MagazineSingleArticle = {
  args: {
    _type: 'articleList',
    _key: 'story-al-mag-1',
    variant: 'magazine',
    heading: 'The Long Read',
    description: 'Single feature — hero only.',
    contentType: 'all',
    limit: 1,
    articles: storyArticles.slice(0, 1),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Magazine boundary case — only 1 article total (the hero). Remaining-articles grid does NOT render because `remainingArticles.length === 0`. Added in Story 19.8 review patch.',
      },
    },
  },
} satisfies Story;

export const MagazineTwoArticles = {
  args: {
    _type: 'articleList',
    _key: 'story-al-mag-2',
    variant: 'magazine',
    heading: 'The Long Read',
    description: 'One hero + one companion card.',
    contentType: 'all',
    limit: 2,
    articles: storyArticles.slice(0, 2),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Magazine boundary case — 2 articles total. Hero renders first; the single remaining card is wrapped in `<div class="max-w-3xl mx-auto">` so it appears centered instead of stretching full-width. Added in Story 19.8 review patch.',
      },
    },
  },
} satisfies Story;

export const MagazineThreeArticles = {
  args: {
    _type: 'articleList',
    _key: 'story-al-mag-3',
    variant: 'magazine',
    heading: 'The Long Read',
    description: 'Hero + 2-card companion row.',
    contentType: 'all',
    limit: 3,
    articles: storyArticles.slice(0, 3),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Magazine boundary case — 3 articles total. Hero renders first; the remaining 2 cards fill a `grid-cols-1 md:grid-cols-2` grid (the middle tier of the tiered remaining-articles layout, between the single-centered-card tier at 1 remaining and the 3-column tier at ≥3 remaining). Added in Story 19.9 code review to close the 2-remaining tier visual coverage gap.',
      },
    },
  },
} satisfies Story;

export const MagazineFourArticles = {
  args: {
    _type: 'articleList',
    _key: 'story-al-mag-4',
    variant: 'magazine',
    heading: 'The Long Read',
    description: 'Hero + 3-card tier.',
    contentType: 'all',
    limit: 4,
    articles: storyArticles.slice(0, 4),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Magazine boundary case — 4 articles total. Hero renders first; remaining 3 cards fill a `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` grid, exercising the upper tier of the tiered remaining-articles layout.',
      },
    },
  },
} satisfies Story;

export const Empty = {
  args: {
    _type: 'articleList',
    _key: 'story-al-empty',
    variant: 'grid',
    heading: 'Empty state',
    contentType: 'all',
    articles: [], // empty array — intentional
  },
  parameters: {
    docs: {
      description: {
        story:
          'Intentional empty state. Renders "No articles to display." inside <SectionContent>. All 5 variants share this behavior — shown here via the grid variant.',
      },
    },
  },
} satisfies Story;

export const GridWithNewsletterCta = {
  args: {
    _type: 'articleList',
    _key: 'story-al-grid-newsletter',
    variant: 'grid',
    heading: 'Latest Articles',
    description: 'News and insights from our team on technology, design, and community.',
    contentType: 'all',
    limit: 6,
    ctaButtons: sharedButtons,
    showNewsletterCta: true,
    articles: storyArticles,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Story 19.7 — grid variant with the compact `<ArticleNewsletterCta>` rendered between the cards grid and the ctaButtons. Used for visual review of the layout decision (D1 in code review): the compact CTA wrapper carries `mt-8 pt-6 border-t` per AC #3, AND the parent `<Section>` uses `flex flex-col gap-16` (64px), so the visual gap between the cards and the border-t separator is the spec-mandated `gap-16 + mt-8` (~96px).',
      },
    },
  },
} satisfies Story;

export const BrutalistWithNewsletterCta = {
  args: {
    _type: 'articleList',
    _key: 'story-al-brutalist-newsletter',
    variant: 'brutalist',
    heading: 'Dispatches',
    description: 'Field reports from the edge of the web.',
    contentType: 'all',
    limit: 6,
    ctaButtons: sharedButtons,
    showNewsletterCta: true,
    articles: storyArticles,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Story 19.7 — brutalist variant with the compact `<ArticleNewsletterCta>`. Pairs with `GridWithNewsletterCta` to verify the CTA insertion is shared across variants and to compare the visual rhythm in a brutalist context (border-brutal cards above, plain border-t separator below).',
      },
    },
  },
} satisfies Story;
