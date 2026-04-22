'use strict';

const { Node, Block } = require('./Node');
const languages = require('./languages');

const constants = {
  ESCAPED_CHAR_REGEX: /^\\./,
  // Per-quote string matchers. These replace the broken unified regex that
  // relied on `[^\1]` inside a character class (which does NOT back-reference
  // the capture group — `\1` inside `[...]` is the octal char `\x01`).
  //
  // Each of these matches an opening quote, a body of either an escaped char
  // or any char that isn't the closing quote, then the closing quote. The
  // body must be non-empty? No — empty strings are valid ("", '', ``), so
  // the body uses `*` not `+`.
  SINGLE_QUOTED_REGEX: /^'((?:\\.|[^'\\\n])*)'/,
  DOUBLE_QUOTED_REGEX: /^"((?:\\.|[^"\\\n])*)"/,
  // Template literals (backtick) may span newlines.
  TEMPLATE_LITERAL_REGEX: /^`((?:\\.|[^`\\])*)`/,
  NEWLINE_REGEX: /^\r*\n/
};

const parse = (input, options = {}) => {
  if (typeof input !== 'string') {
    throw new TypeError('Expected input to be a string');
  }

  const cst = new Block({ type: 'root', nodes: [] });
  const stack = [cst];
  const name = (options.language || 'javascript').toLowerCase();
  const lang = languages[name];

  if (typeof lang === 'undefined') {
    throw new Error(`Language "${name}" is not supported by strip-comments`);
  }

  const { LINE_REGEX, BLOCK_OPEN_REGEX, BLOCK_CLOSE_REGEX } = lang;

  let block = cst;
  let remaining = input;
  let token;
  let prev;

  // Detect "symmetric" block markers like Python's `"""..."""` or `'''...'''`.
  // When open and close are the same token, we cannot enter another block of
  // the same kind while already inside one, and we must not treat the body as
  // a quoted string.
  const source = [BLOCK_OPEN_REGEX, BLOCK_CLOSE_REGEX].filter(Boolean);
  const symmetricBlock = source.length === 2 && source[0].source === source[1].source;

  /**
   * Helpers
   */

  const consume = (value = remaining[0] || '') => {
    remaining = remaining.slice(value.length);
    return value;
  };

  const scan = (regex, type = 'text') => {
    const match = regex.exec(remaining);
    if (match) {
      consume(match[0]);
      return { type, value: match[0], match };
    }
  };

  const push = node => {
    if (prev && prev.type === 'text' && node.type === 'text') {
      prev.value += node.value;
      return;
    }
    block.push(node);
    if (node.nodes) {
      stack.push(node);
      block = node;
    }
    prev = node;
  };

  const pop = () => {
    if (block.type === 'root') {
      throw new SyntaxError('Unclosed block comment');
    }
    stack.pop();
    block = stack[stack.length - 1];
  };

  const tryQuotedString = () => {
    // Don't treat a string as starting right after a word character
    // (e.g. in identifiers like `foo'bar` in some langs, or to avoid breaking
    // on things like `don't` inside plain text). Preserves original behavior.
    if (block.type === 'block') return false;
    if (prev && /\w$/.test(prev.value)) return false;

    const ch = remaining[0];

    // If the language uses a symmetric block marker that starts with this
    // quote char (e.g. Python `"""` or `'''`), don't consume it as a string —
    // let the block-open branch handle it.
    if (symmetricBlock) {
      const marker = BLOCK_OPEN_REGEX.source.replace(/^\^/, '');
      if (remaining.startsWith(marker) && marker[0] === ch) {
        return false;
      }
    }

    let regex;
    if (ch === "'") regex = constants.SINGLE_QUOTED_REGEX;
    else if (ch === '"') regex = constants.DOUBLE_QUOTED_REGEX;
    else if (ch === '`') regex = constants.TEMPLATE_LITERAL_REGEX;
    else return false;

    const tok = scan(regex, 'text');
    if (tok) {
      push(new Node(tok));
      return true;
    }
    return false;
  };

  /**
   * Parse input string
   */

  while (remaining !== '') {
    // escaped characters
    if ((token = scan(constants.ESCAPED_CHAR_REGEX, 'text'))) {
      push(new Node(token));
      continue;
    }

    // quoted strings
    if (tryQuotedString()) {
      continue;
    }

    // newlines
    if ((token = scan(constants.NEWLINE_REGEX, 'newline'))) {
      push(new Node(token));
      continue;
    }

    // block comment open
    if (BLOCK_OPEN_REGEX && options.block && !(symmetricBlock && block.type === 'block')) {
      if ((token = scan(BLOCK_OPEN_REGEX, 'open'))) {
        push(new Block({ type: 'block' }));
        push(new Node(token));
        continue;
      }
    }

    // block comment close
    if (BLOCK_CLOSE_REGEX && block.type === 'block' && options.block) {
      if ((token = scan(BLOCK_CLOSE_REGEX, 'close'))) {
        token.newline = token.match[1] || '';
        push(new Node(token));
        pop();
        continue;
      }
    }

    // line comment
    if (LINE_REGEX && block.type !== 'block' && options.line) {
      if ((token = scan(LINE_REGEX, 'line'))) {
        push(new Node(token));
        continue;
      }
    }

    // Plain text (skip "C" since some languages use "C" to start comments)
    if ((token = scan(/^[a-zABD-Z0-9\t ]+/, 'text'))) {
      push(new Node(token));
      continue;
    }

    push(new Node({ type: 'text', value: consume(remaining[0]) }));
  }

  return cst;
};

module.exports = parse;
