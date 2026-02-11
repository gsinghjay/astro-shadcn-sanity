import type { FaqSectionBlock } from '@/lib/types';

export const faqFull: FaqSectionBlock = {
  _type: 'faqSection',
  _key: 'test-faq-1',
  backgroundVariant: null,
  spacing: 'default',
  maxWidth: 'default',
  heading: 'Frequently Asked Questions',
  items: [
    { _key: 'q1', question: 'What is YWCC?', answer: 'A community for women in computing.' },
    { _key: 'q2', question: 'How do I join?', answer: 'Visit our contact page to sign up.' },
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
