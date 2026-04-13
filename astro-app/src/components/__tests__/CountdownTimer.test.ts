import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import CountdownTimer from '../blocks/custom/CountdownTimer.astro';
import {
  countdownInline,
  countdownHero,
  countdownBanner,
  countdownBrutalist,
  countdownMinimal,
} from './__fixtures__/countdown-timer';

describe('CountdownTimer', () => {
  test('renders inline variant with heading and description', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CountdownTimer, { props: countdownInline });

    expect(html).toContain('Event Countdown');
    expect(html).toContain('Time remaining until launch');
    expect(html).toContain('data-countdown="2027-01-01T00:00:00Z"');
    expect(html).toContain('data-completed-message="We have launched!"');
  });

  test('renders hero variant with container query classes', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CountdownTimer, { props: countdownHero });

    expect(html).toContain('The Big Launch');
    expect(html).toContain('Join us for the main event');
    expect(html).toContain('@3xl:gap-8');
    expect(html).toContain('@3xl:text-8xl');
  });

  test('renders banner variant with compact layout', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CountdownTimer, { props: countdownBanner });

    expect(html).toContain('Sale Ends Soon');
    expect(html).toContain('flex-row');
  });

  test('renders brutalist variant with container query classes', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CountdownTimer, { props: countdownBrutalist });

    expect(html).toContain('Deadline Approaching');
    expect(html).toContain('Submit your entry before time runs out');
    expect(html).toContain('@3xl:gap-6');
    expect(html).toContain('@3xl:text-7xl');
    expect(html).toContain('border-brutal');
    expect(html).toContain('font-mono');
  });

  test('renders placeholder time units', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CountdownTimer, { props: countdownInline });

    expect(html).toContain('Days');
    expect(html).toContain('Hours');
    expect(html).toContain('Min');
    expect(html).toContain('Sec');
  });

  test('generates JSON-LD Event structured data', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CountdownTimer, { props: countdownInline });

    const jsonLdMatch = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
    expect(jsonLdMatch).not.toBeNull();

    const jsonLd = JSON.parse(jsonLdMatch![1]);
    expect(jsonLd['@type']).toBe('Event');
    expect(jsonLd.name).toBe('Event Countdown');
    expect(jsonLd.startDate).toBe('2027-01-01T00:00:00Z');
    expect(jsonLd.description).toBe('Time remaining until launch');
    expect(jsonLd.eventStatus).toBe('https://schema.org/EventScheduled');
  });

  test('defaults to inline variant for unknown variant value', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CountdownTimer, {
      props: { ...countdownInline, variant: 'unknown-variant' as any },
    });

    expect(html).toContain('Event Countdown');
    expect(html).toContain('data-countdown');
  });

  test('handles minimal data without crashing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CountdownTimer, { props: countdownMinimal });

    expect(html).toBeDefined();
    expect(html).toContain('data-countdown="2027-01-01T00:00:00Z"');
  });

  test('omits heading when not provided', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CountdownTimer, { props: countdownMinimal });

    expect(html).not.toContain('<h2');
  });
});
