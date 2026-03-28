import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { status } from '../../src/progress/status.js';
import { ColorLevel } from '../../src/types.js';

function createMockStream() {
  return {
    write: vi.fn(() => true),
    isTTY: false,
    columns: 80,
  } as unknown as NodeJS.WriteStream;
}

describe('status function', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('correctly returns the callback return value', async () => {
    const result = await status(
      'Processing',
      async () => 42,
      { colorLevel: ColorLevel.None, stdout: createMockStream() },
    );
    expect(result).toBe(42);
  });

  it('stops even when callback throws an exception', async () => {
    await expect(
      status(
        'Processing',
        async () => {
          throw new Error('Test error');
        },
        { colorLevel: ColorLevel.None, stdout: createMockStream() },
      ),
    ).rejects.toThrow('Test error');
  });

  it('executes callback even with ColorLevel.None', async () => {
    let called = false;
    await status(
      'Processing',
      async () => {
        called = true;
      },
      { colorLevel: ColorLevel.None, stdout: createMockStream() },
    );
    expect(called).toBe(true);
  });
});
