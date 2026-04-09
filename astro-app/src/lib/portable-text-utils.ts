import { toHTML } from '@portabletext/to-html';
import type { PortableTextBlock } from '@portabletext/types';

export function portableTextToHtml(blocks: PortableTextBlock[]): string {
  return toHTML(blocks);
}

export function portableTextToPlainText(blocks: PortableTextBlock[]): string {
  return blocks
    .map(block => {
      if (block._type !== 'block' || !block.children) return '';
      return (block.children as Array<{ text?: string }>)
        .map(child => child.text || '')
        .join('');
    })
    .join('\n')
    .trim();
}
