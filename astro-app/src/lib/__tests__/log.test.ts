import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { log } from '../log';

describe('log — structured JSON logger', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('info emits {level,msg} JSON via console.log', () => {
    log.info('test-info-event');
    expect(logSpy).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(parsed).toEqual({ level: 'info', msg: 'test-info-event' });
  });

  it('warn emits {level,msg} JSON via console.warn', () => {
    log.warn('test-warn-event');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(warnSpy.mock.calls[0][0] as string);
    expect(parsed).toEqual({ level: 'warn', msg: 'test-warn-event' });
  });

  it('error with Error instance emits message + stack', () => {
    const err = new Error('boom');
    log.error('thing-failed', err);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(errorSpy.mock.calls[0][0] as string);
    expect(parsed.level).toBe('error');
    expect(parsed.msg).toBe('thing-failed');
    expect(parsed.error).toBe('boom');
    expect(typeof parsed.stack).toBe('string');
    expect(parsed.stack).toContain('Error');
  });

  it('error with string error coerces via String()', () => {
    log.error('thing-failed', 'plain string error');
    const parsed = JSON.parse(errorSpy.mock.calls[0][0] as string);
    expect(parsed.error).toBe('plain string error');
    expect(parsed.stack).toBeUndefined();
  });

  it('error with unknown object coerces via String()', () => {
    log.error('thing-failed', { weird: true });
    const parsed = JSON.parse(errorSpy.mock.calls[0][0] as string);
    expect(parsed.error).toBe('[object Object]');
  });

  it('passes arbitrary scalar fields through to JSON', () => {
    log.info('event', { userId: 'u_123', count: 5, flag: true, nullable: null });
    const parsed = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(parsed).toEqual({
      level: 'info',
      msg: 'event',
      userId: 'u_123',
      count: 5,
      flag: true,
      nullable: null,
    });
  });

  it('error preserves fields alongside error/stack', () => {
    log.error('kv-write-failed', new Error('kv timeout'), { keyPrefix: 'sess' });
    const parsed = JSON.parse(errorSpy.mock.calls[0][0] as string);
    expect(parsed.msg).toBe('kv-write-failed');
    expect(parsed.error).toBe('kv timeout');
    expect(parsed.keyPrefix).toBe('sess');
  });

  it('null/undefined fields do not leak unrelated properties', () => {
    log.error('event', new Error('e'), { token: undefined, hash: null });
    const parsed = JSON.parse(errorSpy.mock.calls[0][0] as string);
    // undefined gets dropped by JSON.stringify; null stays
    expect(parsed.hash).toBeNull();
    expect('token' in parsed).toBe(false);
  });
});
