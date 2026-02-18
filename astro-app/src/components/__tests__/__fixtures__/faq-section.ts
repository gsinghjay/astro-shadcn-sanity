import type { FaqSectionBlock } from '@/lib/types';

/** Legacy FAQ data: answer stored as plain string before Portable Text migration */
type LegacyFaqItem = Omit<NonNullable<FaqSectionBlock['items']>[number], 'answer'> & { answer: string };
type LegacyFaqSectionBlock = Omit<FaqSectionBlock, 'items'> & { items: LegacyFaqItem[] };

export const faqFull: FaqSectionBlock = {
  _type: 'faqSection',
  _key: 'test-faq-1',
  backgroundVariant: null,
  spacing: 'default',
  maxWidth: 'default',
  heading: 'Frequently Asked Questions',
  items: [
    {
      _key: 'q1',
      question: 'What is YWCC?',
      answer: [
        {
          _type: 'block',
          _key: 'a1',
          style: 'normal',
          children: [
            { _type: 'span', _key: 's1', text: 'A community for ', marks: [] },
            { _type: 'span', _key: 's2', text: 'women in computing', marks: ['strong'] },
            { _type: 'span', _key: 's3', text: '.', marks: [] },
          ],
          markDefs: [],
        },
      ],
    },
    {
      _key: 'q2',
      question: 'How do I join?',
      answer: [
        {
          _type: 'block',
          _key: 'a2',
          style: 'normal',
          children: [{ _type: 'span', _key: 's4', text: 'Visit our contact page to sign up.', marks: [] }],
          markDefs: [],
        },
      ],
    },
  ],
};

/** Legacy data: answer stored as plain string (pre-migration) */
export const faqLegacyString: LegacyFaqSectionBlock = {
  _type: 'faqSection',
  _key: 'test-faq-3',
  backgroundVariant: null,
  spacing: 'default',
  maxWidth: 'default',
  heading: 'Old FAQs',
  items: [
    { _key: 'q1', question: 'Legacy question?', answer: 'Plain text answer.' },
  ],
};

export const faqMinimal: FaqSectionBlock = {
  _type: 'faqSection',
  _key: 'test-faq-2',
  backgroundVariant: null,
  spacing: null,
  maxWidth: null,
  heading: null,
  items: null,
};
