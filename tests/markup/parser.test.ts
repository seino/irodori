import { describe, it, expect } from 'vitest';
import { parse, tokenize } from '../../src/markup/parser.js';

describe('tokenize', () => {
  it('tokenizes plain text', () => {
    expect(tokenize('hello')).toEqual([{ type: 'text', value: 'hello' }]);
  });

  it('tokenizes an opening tag', () => {
    const tokens = tokenize('[bold]hello[/]');
    expect(tokens).toEqual([
      { type: 'open', tags: ['bold'] },
      { type: 'text', value: 'hello' },
      { type: 'close', tags: [] },
    ]);
  });

  it('tokenizes an opening tag with multiple tags', () => {
    const tokens = tokenize('[bold red]x[/]');
    expect(tokens).toEqual([
      { type: 'open', tags: ['bold', 'red'] },
      { type: 'text', value: 'x' },
      { type: 'close', tags: [] },
    ]);
  });

  it('treats escaped [ as text', () => {
    expect(tokenize('\\[not a tag\\]')).toEqual([
      { type: 'text', value: '[not a tag]' },
    ]);
  });

  it('treats invalid tags as text', () => {
    expect(tokenize('[not_a_tag]')).toEqual([
      { type: 'text', value: '[not_a_tag]' },
    ]);
  });
});

describe('parse', () => {
  it('parses plain text', () => {
    expect(parse('hello')).toEqual([{ text: 'hello', style: {} }]);
  });

  it('parses bold tag', () => {
    expect(parse('[bold]hello[/]')).toEqual([
      { text: 'hello', style: { bold: true } },
    ]);
  });

  it('parses color tag', () => {
    expect(parse('[red]error[/]')).toEqual([
      { text: 'error', style: { color: 'red' } },
    ]);
  });

  it('parses combined styles', () => {
    expect(parse('[bold red]hello[/]')).toEqual([
      { text: 'hello', style: { bold: true, color: 'red' } },
    ]);
  });

  it('merges nested styles', () => {
    const result = parse('[bold][red]x[/][/]');
    expect(result).toEqual([
      { text: 'x', style: { bold: true, color: 'red' } },
    ]);
  });

  it('parses hex color', () => {
    expect(parse('[#ff0000]red[/]')).toEqual([
      { text: 'red', style: { color: '#ff0000' } },
    ]);
  });

  it('parses background color (on)', () => {
    expect(parse('[on blue]text[/]')).toEqual([
      { text: 'text', style: { bgColor: 'blue' } },
    ]);
  });

  it('treats invalid tags as text', () => {
    expect(parse('[not_a_tag]')).toEqual([
      { text: '[not_a_tag]', style: {} },
    ]);
  });

  it('mixes styled text and plain text', () => {
    const result = parse('[bold]hello[/] world');
    expect(result).toEqual([
      { text: 'hello', style: { bold: true } },
      { text: ' world', style: {} },
    ]);
  });

  it('resets all styles with [/]', () => {
    const result = parse('[bold][italic]hello[/] world');
    expect(result).toEqual([
      { text: 'hello', style: { bold: true, italic: true } },
      { text: ' world', style: {} },
    ]);
  });

  it('parses link', () => {
    expect(parse('[link=https://example.com]click[/]')).toEqual([
      { text: 'click', style: { link: 'https://example.com' } },
    ]);
  });

  it('parses italic', () => {
    expect(parse('[italic]text[/]')).toEqual([
      { text: 'text', style: { italic: true } },
    ]);
  });

  it('parses underline', () => {
    expect(parse('[underline]text[/]')).toEqual([
      { text: 'text', style: { underline: true } },
    ]);
  });

  it('parses strikethrough', () => {
    expect(parse('[strikethrough]text[/]')).toEqual([
      { text: 'text', style: { strikethrough: true } },
    ]);
  });
});
