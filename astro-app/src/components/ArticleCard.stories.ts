/**
 * Strict CSF3 template — see `@/lib/storybook-types` for the Meta/StoryObj
 * adapter. Story 7.18 (Epic 7 project-wide CSF3 sweep) uses this file as its
 * canonical reference. Every type annotation, import, and args shape below
 * is intentional and reproducible.
 */
import type { Meta, StoryObj } from '@/lib/storybook-types';
import ArticleCard from './ArticleCard.astro';
import { storyArticles } from './__fixtures__/articles';

const meta = {
  title: 'Components/ArticleCard',
  component: ArticleCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Shared article card used by /articles listing, related-articles section of /articles/[slug], and the ArticleList block grid/split-featured/magazine variants. Renders a 1280×720 responsive image (lazy), category badge, publish date, title link, excerpt (line-clamp-3), and optional author byline.',
      },
    },
  },
  argTypes: {
    article: {
      description: 'Article projection — typed as Article | RelatedArticle',
      control: false, // object control is noisy; stories pass the arg directly
    },
  },
} satisfies Meta<typeof ArticleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  args: { article: storyArticles[0] },
  parameters: {
    docs: {
      description: {
        story:
          'Full article with featured image, author link, category badge, and excerpt — the primary visual reference for ArticleCard.',
      },
    },
  },
} satisfies Story;

export const NoImage = {
  args: { article: storyArticles.find((a) => !a.featuredImage) },
  parameters: {
    docs: {
      description: {
        story:
          'Card renders without its featured image — title, excerpt, and byline still lay out correctly using the img-optional branch in ArticleCard.astro.',
      },
    },
  },
} satisfies Story;

export const NoAuthor = {
  args: { article: storyArticles.find((a) => !a.author) },
  parameters: {
    docs: {
      description: {
        story:
          'Card with no author — the byline branch is hidden entirely. Category badge and publish date still render above the title.',
      },
    },
  },
} satisfies Story;

export const LongTitle = {
  args: {
    article: storyArticles.find((a) => (a.title?.length ?? 0) >= 80),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Headline ≥80 characters — exercises the title wrap behavior (no truncation; the card grows vertically).',
      },
    },
  },
} satisfies Story;

export const LongExcerpt = {
  args: {
    article: storyArticles.find((a) => (a.excerpt?.length ?? 0) >= 250),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Excerpt ≥250 characters — exercises the `line-clamp-3` truncation applied to the card body paragraph.',
      },
    },
  },
} satisfies Story;
