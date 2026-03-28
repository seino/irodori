/**
 * Markup parser: converts [bold red]text[/] syntax to Span[]
 */
import type { Token, Span, Style } from '../types.js';
import { mergeStyles, parseStyleTags } from './style.js';

/**
 * Converts a markup string to a token sequence
 * @param markup Markup string
 */
export function tokenize(markup: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let textBuf = '';

  const flushText = (): void => {
    if (textBuf !== '') {
      tokens.push({ type: 'text', value: textBuf });
      textBuf = '';
    }
  };

  while (i < markup.length) {
    // Escape: \[ -> literal [, \] -> literal ]
    if (markup[i] === '\\' && i + 1 < markup.length && (markup[i + 1] === '[' || markup[i + 1] === ']')) {
      textBuf += markup[i + 1];
      i += 2;
      continue;
    }

    // Tag start
    if (markup[i] === '[') {
      const closeIdx = markup.indexOf(']', i + 1);
      if (closeIdx === -1) {
        textBuf += markup[i];
        i++;
        continue;
      }

      const tagContent = markup.slice(i + 1, closeIdx).trim();
      if (tagContent === '') {
        textBuf += markup.slice(i, closeIdx + 1);
        i = closeIdx + 1;
        continue;
      }

      // Close tag: [/] or [/bold]
      if (tagContent.startsWith('/')) {
        const closeTags = tagContent.slice(1).trim();
        flushText();
        tokens.push({
          type: 'close',
          tags: closeTags === '' ? [] : closeTags.split(/\s+/),
        });
        i = closeIdx + 1;
        continue;
      }

      // Open tag: [bold red] etc.
      const tags = tagContent.split(/\s+/);
      const style = parseStyleTags(tags);
      if (style !== null) {
        flushText();
        tokens.push({ type: 'open', tags });
        i = closeIdx + 1;
        continue;
      }

      // Unrecognized tags are treated as text
      textBuf += markup.slice(i, closeIdx + 1);
      i = closeIdx + 1;
      continue;
    }

    textBuf += markup[i];
    i++;
  }

  flushText();
  return tokens;
}

/**
 * Converts a markup string to Span[]
 * @param markup Markup string (e.g. '[bold red]Hello[/] World')
 */
export function parse(markup: string): Span[] {
  const tokens = tokenize(markup);
  const styleStack: { tags: string[]; style: Style }[] = [{ tags: [], style: {} }];
  const spans: Span[] = [];

  for (const token of tokens) {
    if (token.type === 'text') {
      const currentStyle = mergeStyles(styleStack.map((entry) => entry.style));
      spans.push({ text: token.value, style: currentStyle });
    } else if (token.type === 'open') {
      const style = parseStyleTags(token.tags);
      if (style) {
        styleStack.push({ tags: token.tags, style });
      }
    } else if (token.type === 'close') {
      if (token.tags.length === 0) {
        // [/] resets entire stack (truncate to keep root entry only)
        if (styleStack.length > 1) {
          styleStack.length = 1;
        }
      } else {
        // [/bold] etc: find and remove the matching entry from the end of the stack
        const closeTag = token.tags[0]?.toLowerCase();
        if (closeTag) {
          for (let i = styleStack.length - 1; i > 0; i--) {
            const entry = styleStack[i];
            if (entry && entry.tags.some((t) => t.toLowerCase() === closeTag)) {
              styleStack.splice(i, 1);
              break;
            }
          }
        }
      }
    }
  }

  return spans;
}
