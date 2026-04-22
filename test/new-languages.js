/*!
 * strip-comments <https://github.com/jonschlinkert/strip-comments>
 *
 * Copyright (c) 2014-present, Jon Schlinkert.
 * Released under the MIT license.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const strip = require('../index');

const fixture = path.join.bind(path, __dirname, 'fixtures/new-languages');
const expected = path.join.bind(path, __dirname, 'expected/new-languages');
const read = src => fs.readFileSync(src, 'utf-8').replace(/\r*\n/g, '\n');

describe('new languages: Rust', () => {
  it('strips // line comments', () => {
    const input = 'let x = 1; // comment\nlet y = 2;';
    assert.strictEqual(strip(input, { language: 'rust' }), 'let x = 1; \nlet y = 2;');
  });

  it('strips /* */ block comments', () => {
    const input = '/* doc */ let x = 1;';
    assert.strictEqual(strip(input, { language: 'rust' }), ' let x = 1;');
  });

  it('strips /// doc comments (matched by //)', () => {
    const input = '/// doc\nfn foo() {}';
    assert.strictEqual(strip(input, { language: 'rust' }), '\nfn foo() {}');
  });

  it('fixture round-trips', () => {
    const input = read(fixture('rust.txt'));
    const output = read(expected('rust.txt'));
    assert.strictEqual(strip(input, { language: 'rust' }), output);
  });
});

describe('new languages: Go', () => {
  it('strips // line comments', () => {
    const input = 'x := 1 // comment\ny := 2';
    assert.strictEqual(strip(input, { language: 'go' }), 'x := 1 \ny := 2');
  });

  it('strips /* */ block comments including package docs', () => {
    const input = '/*\nPackage foo does things.\n*/\npackage foo';
    assert.strictEqual(strip(input, { language: 'go' }), 'package foo');
  });

  it('fixture round-trips', () => {
    const input = read(fixture('go.txt'));
    const output = read(expected('go.txt'));
    assert.strictEqual(strip(input, { language: 'go' }), output);
  });
});

describe('new languages: Kotlin', () => {
  it('strips // and /* */', () => {
    const input = '// header\nfun add(a: Int, b: Int) = a + b /* inline */';
    assert.strictEqual(strip(input, { language: 'kotlin' }), '\nfun add(a: Int, b: Int) = a + b ');
  });

  it('accepts the kt alias', () => {
    const input = '// header\nval x = 1';
    assert.strictEqual(strip(input, { language: 'kt' }), '\nval x = 1');
  });
});

describe('new languages: Dart', () => {
  it('strips // and /* */', () => {
    const input = 'void main() { /* noop */ } // trailing';
    assert.strictEqual(strip(input, { language: 'dart' }), 'void main() {  } ');
  });
});

describe('new languages: Scala', () => {
  it('strips // and /* */', () => {
    const input = '/* banner */\nobject Main // comment';
    assert.strictEqual(strip(input, { language: 'scala' }), 'object Main ');
  });
});

describe('new languages: JSON with comments (jsonc / json5)', () => {
  it('jsonc strips // and /* */ while preserving string values', () => {
    const input = '{\n  // key\n  "url": "https://example.com",\n  /* meta */ "n": 1\n}';
    const actual = strip(input, { language: 'jsonc' });
    assert.strictEqual(actual, '{\n  \n  "url": "https://example.com",\n   "n": 1\n}');
  });

  it('json5 accepts the same input', () => {
    const input = '{ /* x */ "a": 1 }';
    assert.strictEqual(strip(input, { language: 'json5' }), '{  "a": 1 }');
  });
});

describe('new languages: JSX / TSX', () => {
  it('strips JS-style comments at the top level', () => {
    const input = "import React from 'react'; // top\nfunction X() { return <div/>; }";
    assert.strictEqual(
      strip(input, { language: 'jsx' }),
      "import React from 'react'; \nfunction X() { return <div/>; }"
    );
  });

  it('strips /* */ inside JSX expression braces', () => {
    const input = 'const el = <div>{/* inline jsx comment */}</div>;';
    assert.strictEqual(
      strip(input, { language: 'tsx' }),
      'const el = <div>{}</div>;'
    );
  });
});

describe('new languages: Vue / Svelte', () => {
  it('defaults to JS-style stripping (users pass language:html for html blocks)', () => {
    const input = '<script>\n// setup\nexport default { data() { return {} } }\n</script>';
    assert.strictEqual(
      strip(input, { language: 'vue' }),
      '<script>\n\nexport default { data() { return {} } }\n</script>'
    );
  });
});

describe('new languages: TOML', () => {
  it('strips # line comments and preserves strings containing #', () => {
    const input = '# top\nname = "value"\nurl = "#fragment"\n# trailing';
    const actual = strip(input, { language: 'toml' });
    assert.strictEqual(actual, '\nname = "value"\nurl = "#fragment"\n');
  });

  it('fixture round-trips', () => {
    const input = read(fixture('toml.txt'));
    const output = read(expected('toml.txt'));
    assert.strictEqual(strip(input, { language: 'toml' }), output);
  });
});

describe('new languages: INI', () => {
  it('strips # and ; line comments', () => {
    const input = '[section]\nkey = val  ; trailing\nother = 1  # also trailing';
    assert.strictEqual(
      strip(input, { language: 'ini' }),
      '[section]\nkey = val  \nother = 1  '
    );
  });
});

describe('new languages: YAML', () => {
  it('strips # line comments and preserves strings containing #', () => {
    const input = 'name: "#not-a-comment"\n# real comment\nage: 30';
    assert.strictEqual(
      strip(input, { language: 'yaml' }),
      'name: "#not-a-comment"\n\nage: 30'
    );
  });

  it('accepts the yml alias', () => {
    const input = 'key: val # comment';
    assert.strictEqual(strip(input, { language: 'yml' }), 'key: val ');
  });

  it('fixture round-trips', () => {
    const input = read(fixture('yaml.txt'));
    const output = read(expected('yaml.txt'));
    assert.strictEqual(strip(input, { language: 'yaml' }), output);
  });
});

describe('new languages: Shell / Bash', () => {
  it('strips # line comments', () => {
    const input = '#!/bin/bash\necho "hi"  # greet\ncd /tmp';
    const actual = strip(input, { language: 'bash' });
    // Note: the first-line #! is still a # comment from bash's perspective
    // and will be stripped. The shebang language is a separate entry.
    assert.strictEqual(actual, '\necho "hi"  \ncd /tmp');
  });

  it('preserves # inside strings', () => {
    const input = 'echo "#not a comment" # trailing';
    assert.strictEqual(strip(input, { language: 'sh' }), 'echo "#not a comment" ');
  });
});

describe('new languages: PowerShell', () => {
  it('strips # line comments', () => {
    const input = '$x = 1 # trailing\n$y = 2';
    assert.strictEqual(strip(input, { language: 'powershell' }), '$x = 1 \n$y = 2');
  });

  it('strips <# ... #> block comments', () => {
    const input = '$x = 1\n<#\n  synopsis\n#>\n$y = 2';
    assert.strictEqual(
      strip(input, { language: 'powershell' }),
      '$x = 1\n\n$y = 2'
    );
  });

  it('accepts the ps1 alias', () => {
    const input = '$x = 1 # trailing';
    assert.strictEqual(strip(input, { language: 'ps1' }), '$x = 1 ');
  });

  it('fixture round-trips', () => {
    const input = read(fixture('powershell.txt'));
    const output = read(expected('powershell.txt'));
    assert.strictEqual(strip(input, { language: 'powershell' }), output);
  });
});

describe('new languages: Batch', () => {
  it('strips REM line comments (case-insensitive)', () => {
    const input = 'echo hi\nREM this is a comment\nrem also a comment\necho bye';
    assert.strictEqual(
      strip(input, { language: 'batch' }),
      'echo hi\n\n\necho bye'
    );
  });

  it('strips :: line comments', () => {
    const input = 'echo hi\n:: comment\necho bye';
    assert.strictEqual(
      strip(input, { language: 'batch' }),
      'echo hi\n\necho bye'
    );
  });

  it('does not mangle REM inside a larger word like REMOTE', () => {
    const input = 'set REMOTE=1';
    assert.strictEqual(strip(input, { language: 'batch' }), 'set REMOTE=1');
  });

  it('accepts bat and cmd aliases', () => {
    const input = 'REM comment\necho x';
    assert.strictEqual(strip(input, { language: 'bat' }), '\necho x');
    assert.strictEqual(strip(input, { language: 'cmd' }), '\necho x');
  });
});

describe('new languages: R', () => {
  it('strips # line comments', () => {
    const input = 'x <- 1  # assign\ny <- 2';
    assert.strictEqual(strip(input, { language: 'r' }), 'x <- 1  \ny <- 2');
  });
});

describe('new languages: Elixir', () => {
  it('strips # line comments', () => {
    const input = 'defmodule X do\n  # note\n  def y, do: 1\nend';
    assert.strictEqual(
      strip(input, { language: 'elixir' }),
      'defmodule X do\n  \n  def y, do: 1\nend'
    );
  });
});

describe('new languages: SCSS alias', () => {
  it('strips // and /* */ like SCSS', () => {
    const input = '// variable\n$color: red; /* inline */';
    assert.strictEqual(strip(input, { language: 'scss' }), '\n$color: red; ');
  });
});

describe('new languages: typescript canonical alias', () => {
  it('accepts typescript (canonical spelling)', () => {
    const input = "const x: number = 1; // comment";
    assert.strictEqual(strip(input, { language: 'typescript' }), 'const x: number = 1; ');
  });

  it('still accepts the historical typscript typo alias', () => {
    const input = "const x: number = 1; // comment";
    assert.strictEqual(strip(input, { language: 'typscript' }), 'const x: number = 1; ');
  });
});
