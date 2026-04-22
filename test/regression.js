/*!
 * strip-comments <https://github.com/jonschlinkert/strip-comments>
 *
 * Copyright (c) 2014-present, Jon Schlinkert.
 * Released under the MIT license.
 */

'use strict';

const assert = require('assert');
const strip = require('../index');

describe('regression: string-aware parsing', () => {
  // The original bug report: glob('/*.php') in a PHP file would cause the
  // parser to treat /* inside the string as the start of a block comment,
  // eating everything after it until EOF or a real */.
  it('does not treat /* inside a single-quoted string as a block-comment open', () => {
    const input = "$files = glob($root . '/*.php');";
    const actual = strip(input);
    assert.strictEqual(actual, input);
  });

  it('does not truncate code after a string containing /*', () => {
    const input = [
      "$candidates = glob($plugin_root . '/*.php') ?: [];",
      "foreach ($candidates as $c) {",
      "  echo $c;",
      "}"
    ].join('\n');
    const actual = strip(input);
    assert.strictEqual(actual, input);
  });

  it('preserves URLs in double-quoted strings across // stripping', () => {
    const input = 'const url = "https://example.com/path";';
    assert.strictEqual(strip(input), input);
  });

  it('preserves URLs in single-quoted strings across // stripping', () => {
    const input = "const url = 'https://example.com/path';";
    assert.strictEqual(strip(input), input);
  });

  it('preserves # inside strings when language has # line comments', () => {
    const input = 'x = "#not-a-comment"  # real comment';
    const actual = strip(input, { language: 'python' });
    assert.strictEqual(actual, 'x = "#not-a-comment"  ');
  });

  it('handles escaped quotes inside strings', () => {
    const input = 'const s = "he said \\"hi // there\\"";';
    assert.strictEqual(strip(input), input);
  });

  it('handles empty single-quoted strings', () => {
    const input = "const s = ''; // comment";
    assert.strictEqual(strip(input), "const s = ''; ");
  });

  it('handles empty double-quoted strings', () => {
    const input = 'const s = ""; // comment';
    assert.strictEqual(strip(input), 'const s = ""; ');
  });

  it('handles empty template literals', () => {
    const input = 'const s = ``; // comment';
    assert.strictEqual(strip(input), 'const s = ``; ');
  });

  it('handles template literals that span multiple lines', () => {
    const input = 'const s = `line one\nline two // not a comment`;\nconst x = 1;';
    assert.strictEqual(strip(input), input);
  });

  it('handles backslash at end of string body (escaped backslash)', () => {
    const input = 'const s = "a\\\\"; // real comment';
    assert.strictEqual(strip(input), 'const s = "a\\\\"; ');
  });

  it('handles multiple strings with comment markers on the same line', () => {
    const input = 'const a = "/*x*/"; const b = "//y"; // strip me';
    assert.strictEqual(strip(input), 'const a = "/*x*/"; const b = "//y"; ');
  });

  it('handles string immediately followed by another string', () => {
    const input = "const a = 'x' + 'y'; // comment";
    assert.strictEqual(strip(input), "const a = 'x' + 'y'; ");
  });
});

describe('regression: PHP line-comment at EOF', () => {
  it('strips # comment at end of file with no trailing newline', () => {
    const input = '<?php\n$x = 1; # tail';
    const actual = strip(input, { language: 'php' });
    assert.strictEqual(actual, '<?php\n$x = 1; ');
  });

  it('strips // comment at end of file with no trailing newline', () => {
    const input = '<?php\n$x = 1; // tail';
    const actual = strip(input, { language: 'php' });
    assert.strictEqual(actual, '<?php\n$x = 1; ');
  });

  it('still terminates PHP line comment at ?> close tag', () => {
    const input = '<?php $x = 1; // stop here ?> <p>html</p>';
    const actual = strip(input, { language: 'php' });
    assert.strictEqual(actual, '<?php $x = 1; ?> <p>html</p>');
  });
});

describe('regression: unterminated / malformed input', () => {
  it('does not hang on unterminated single-quoted string', () => {
    const input = "const x = 'never closed\nconst y = 2;";
    const actual = strip(input);
    // The string bails at newline; subsequent lines parse normally.
    assert.ok(actual.includes('const y = 2;'));
  });

  it('does not hang on unterminated double-quoted string', () => {
    const input = 'const x = "never closed\nconst y = 2;';
    const actual = strip(input);
    assert.ok(actual.includes('const y = 2;'));
  });

  it('handles unterminated block comments', () => {
    const input = "const x = 1;\n/* never closed";
    const actual = strip(input);
    assert.strictEqual(actual, 'const x = 1;\n');
  });

  it('tolerates consecutive strings and comments', () => {
    const input = "'a'/*b*/'c'//d\n'e'";
    const actual = strip(input);
    assert.strictEqual(actual, "'a''c'\n'e'");
  });
});
