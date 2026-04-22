/*!
 * strip-comments <https://github.com/jonschlinkert/strip-comments>
 *
 * Copyright (c) 2014-present, Jon Schlinkert.
 * Released under the MIT license.
 */

'use strict';

const assert = require('assert');
const strip = require('../index');

describe('strings: single-quoted', () => {
  it('basic string with no specials', () => {
    const input = "const s = 'hello world';";
    assert.strictEqual(strip(input), input);
  });

  it('string containing a double quote', () => {
    const input = "const s = 'say \"hi\"';";
    assert.strictEqual(strip(input), input);
  });

  it('string containing a backtick', () => {
    const input = "const s = 'a`b`c';";
    assert.strictEqual(strip(input), input);
  });

  it('string containing escaped single quote', () => {
    const input = "const s = 'it\\'s fine';";
    assert.strictEqual(strip(input), input);
  });

  it('string containing /*', () => {
    const input = "const s = '/* not a comment */';";
    assert.strictEqual(strip(input), input);
  });

  it('string containing //', () => {
    const input = "const s = '// not a comment';";
    assert.strictEqual(strip(input), input);
  });

  it('string containing both /* and //', () => {
    const input = "const s = '/* // */';";
    assert.strictEqual(strip(input), input);
  });

  it('two adjacent single-quoted strings', () => {
    const input = "const s = 'a' + 'b'; // strip";
    assert.strictEqual(strip(input), "const s = 'a' + 'b'; ");
  });

  it('empty single-quoted string', () => {
    const input = "const s = '';";
    assert.strictEqual(strip(input), input);
  });
});

describe('strings: double-quoted', () => {
  it('basic string with no specials', () => {
    const input = 'const s = "hello world";';
    assert.strictEqual(strip(input), input);
  });

  it('string containing a single quote', () => {
    const input = 'const s = "it\'s fine";';
    assert.strictEqual(strip(input), input);
  });

  it('string containing escaped double quote', () => {
    const input = 'const s = "she said \\"hi\\"";';
    assert.strictEqual(strip(input), input);
  });

  it('string containing escaped backslash then quote', () => {
    const input = 'const s = "ends with backslash: \\\\";';
    assert.strictEqual(strip(input), input);
  });

  it('string containing /*', () => {
    const input = 'const s = "/* not a comment */";';
    assert.strictEqual(strip(input), input);
  });

  it('string containing //', () => {
    const input = 'const s = "// not a comment";';
    assert.strictEqual(strip(input), input);
  });

  it('URL with ://', () => {
    const input = 'const s = "https://example.com";';
    assert.strictEqual(strip(input), input);
  });

  it('string immediately followed by a real comment', () => {
    const input = 'const s = "value"; // strip me';
    assert.strictEqual(strip(input), 'const s = "value"; ');
  });

  it('empty double-quoted string', () => {
    const input = 'const s = "";';
    assert.strictEqual(strip(input), input);
  });
});

describe('strings: template literals', () => {
  it('basic single-line template literal', () => {
    const input = 'const s = `hello`;';
    assert.strictEqual(strip(input), input);
  });

  it('multi-line template literal preserved across lines', () => {
    const input = 'const s = `line one\nline two`;';
    assert.strictEqual(strip(input), input);
  });

  it('template literal containing //', () => {
    const input = 'const s = `https://example.com`;';
    assert.strictEqual(strip(input), input);
  });

  it('template literal containing /*', () => {
    const input = 'const s = `/* not a comment */`;';
    assert.strictEqual(strip(input), input);
  });

  it('template literal followed by a real // comment', () => {
    const input = 'const s = `hello`; // strip me';
    assert.strictEqual(strip(input), 'const s = `hello`; ');
  });

  it('escaped backtick inside template literal', () => {
    const input = 'const s = `a\\`b`;';
    assert.strictEqual(strip(input), input);
  });

  it('empty template literal', () => {
    const input = 'const s = ``;';
    assert.strictEqual(strip(input), input);
  });

  it('tagged template literal', () => {
    const input = 'const s = tag`hello ${name}`; // comment';
    assert.strictEqual(strip(input), 'const s = tag`hello ${name}`; ');
  });
});

describe('strings: interaction with comments', () => {
  it('comment-looking content inside a string does not affect stripping of a real later comment', () => {
    const input = 'const a = "/*fake*/"; /* real */ const b = 2;';
    assert.strictEqual(strip(input), 'const a = "/*fake*/";  const b = 2;');
  });

  it('strings after block comments still tokenize correctly', () => {
    const input = '/* strip */ const s = "https://example.com";';
    assert.strictEqual(strip(input), ' const s = "https://example.com";');
  });

  it('line comment after string with embedded quote', () => {
    const input = 'const s = "he said \\"hi\\""; // comment';
    assert.strictEqual(strip(input), 'const s = "he said \\"hi\\""; ');
  });

  it('three strings with comment markers and a trailing comment', () => {
    const input = "var a = '//x'; var b = '/*y*/'; var c = '`z`'; // real";
    assert.strictEqual(strip(input), "var a = '//x'; var b = '/*y*/'; var c = '`z`'; ");
  });
});

describe('strings: the original broken regex case', () => {
  // These are the specific patterns the original QUOTED_STRING_REGEX got wrong
  // because of the `[^\1]` backreference-in-char-class bug.

  it('single-quoted string with only /* inside does not start a block comment', () => {
    const input = "x = '/*';\nmore();";
    assert.strictEqual(strip(input), "x = '/*';\nmore();");
  });

  it('single-quoted string followed by text that contains */', () => {
    const input = "x = '/*'; y = '*/';";
    assert.strictEqual(strip(input), "x = '/*'; y = '*/';");
  });

  it('sequence of globs stays intact', () => {
    const input = "var path = '/path/*/something/*/stripped.js';";
    assert.strictEqual(strip(input), input);
  });

  it('globstar stays intact', () => {
    const input = "var path = './do/not/strip/globs/**/*.js';";
    assert.strictEqual(strip(input), input);
  });
});
