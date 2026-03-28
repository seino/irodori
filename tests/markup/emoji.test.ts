import { describe, it, expect } from 'vitest';
import { replaceEmoji } from '../../src/markup/emoji.js';

describe('replaceEmoji', () => {
  it('converts :fire: to emoji', () => {
    expect(replaceEmoji(':fire:')).toBe('🔥');
  });

  it('converts :thumbsup: to emoji', () => {
    expect(replaceEmoji(':thumbsup:')).toBe('👍');
  });

  it('converts :check: to emoji', () => {
    expect(replaceEmoji(':check:')).toBe('✅');
  });

  it('returns unregistered emoji names as-is', () => {
    expect(replaceEmoji(':unknown_emoji:')).toBe(':unknown_emoji:');
  });

  it('converts multiple emojis at once', () => {
    expect(replaceEmoji(':fire: :check:')).toBe('🔥 ✅');
  });

  it('returns text without emoji codes as-is', () => {
    expect(replaceEmoji('hello world')).toBe('hello world');
  });

  it('returns empty string for empty input', () => {
    expect(replaceEmoji('')).toBe('');
  });

  it('converts emoji in the middle of text', () => {
    expect(replaceEmoji('start :rocket: end')).toBe('start 🚀 end');
  });

  it('does not match codes containing uppercase letters', () => {
    expect(replaceEmoji(':Fire:')).toBe(':Fire:');
  });
});
