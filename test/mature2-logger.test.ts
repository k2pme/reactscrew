import { describe, expect, it, vi } from 'vitest';
import { createScrewLogger } from '../src';

describe('createScrewLogger', () => {
  it('logs info messages at info level', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const logger = createScrewLogger({ level: 'info' });

    logger.info('test message');

    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][0]).toContain('test message');
    spy.mockRestore();
  });

  it('filters debug messages when level is info', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const logger = createScrewLogger({ level: 'info' });

    logger.debug('should not appear');

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('outputs json format', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const logger = createScrewLogger({ level: 'debug', format: 'json' });

    logger.info('hello', { key: 'val' });

    const output = JSON.parse(spy.mock.calls[0][0]);
    expect(output.level).toBe('info');
    expect(output.message).toBe('hello');
    expect(output.key).toBe('val');
    spy.mockRestore();
  });

  it('disabled logger does not log', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const logger = createScrewLogger({ level: 'info', enabled: false });

    logger.info('silent');

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('child logger inherits config with prefix', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const parent = createScrewLogger({ level: 'debug', prefix: '[parent]' });
    const child = parent.child('[child]');

    child.info('test');

    expect(spy.mock.calls[0][0]).toContain('[parent] [child]');
    spy.mockRestore();
  });
});
