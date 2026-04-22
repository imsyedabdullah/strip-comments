'use strict';

exports.ada = { LINE_REGEX: /^--.*/ };
exports.apl = { LINE_REGEX: /^⍝.*/ };

exports.applescript = {
  BLOCK_OPEN_REGEX: /^\(\*/,
  BLOCK_CLOSE_REGEX: /^\*\)/
};

exports.csharp = {
  LINE_REGEX: /^\/\/.*/
};

exports.haskell = {
  BLOCK_OPEN_REGEX: /^\{-/,
  BLOCK_CLOSE_REGEX: /^-\}/,
  LINE_REGEX: /^--.*/
};

exports.html = {
  BLOCK_OPEN_REGEX: /^\n*<!--(?!-?>)/,
  BLOCK_CLOSE_REGEX: /^(?<!(?:<!-))-->/,
  BLOCK_CLOSE_LOOSE_REGEX: /^(?<!(?:<!-))--\s*>/,
  BLOCK_CLOSE_STRICT_NEWLINE_REGEX: /^(?<!(?:<!-))-->(\s*\n+|\n*)/,
  BLOCK_CLOSE_STRICT_LOOSE_REGEX: /^(?<!(?:<!-))--\s*>(\s*\n+|\n*)/
};

exports.javascript = {
  BLOCK_OPEN_REGEX: /^\/\*\*?(!?)/,
  BLOCK_CLOSE_REGEX: /^\*\/(\n?)/,
  LINE_REGEX: /^\/\/(!?).*/
};

exports.lua = {
  BLOCK_OPEN_REGEX: /^--\[\[/,
  BLOCK_CLOSE_REGEX: /^\]\]/,
  LINE_REGEX: /^--.*/
};

exports.matlab = {
  BLOCK_OPEN_REGEX: /^%{/,
  BLOCK_CLOSE_REGEX: /^%}/,
  LINE_REGEX: /^%.*/
};

exports.perl = {
  LINE_REGEX: /^#.*/
};

exports.php = {
  ...exports.javascript,
  // The original trailing lookahead `(?=\?>|\n)` failed to match a trailing
  // `#` or `//` comment at EOF (no newline, no closing `?>` tag). Match the
  // whole line to end-of-string or end-of-line instead, and keep the special
  // case that a PHP close tag `?>` terminates the comment.
  LINE_REGEX: /^(?:#|\/\/)[^\n]*?(?=\?>|\n|$)/
};

exports.python = {
  BLOCK_OPEN_REGEX: /^"""/,
  BLOCK_CLOSE_REGEX: /^"""/,
  LINE_REGEX: /^#.*/
};

exports.ruby = {
  BLOCK_OPEN_REGEX: /^=begin/,
  BLOCK_CLOSE_REGEX: /^=end/,
  LINE_REGEX: /^#.*/
};

exports.shebang = exports.hashbang = {
  LINE_REGEX: /^#!.*/
};

// ---- Added languages --------------------------------------------------------

// Rust: C-style comments; inner/outer doc comments (`//!`, `///`, `/*!`, `/**`)
// all fall under the existing JS-style regexes.
exports.rust = exports.javascript;

// Go: C-style comments.
exports.go = exports.javascript;

// Kotlin: C-style comments.
exports.kotlin = exports.javascript;
exports.kt = exports.javascript;

// Dart: C-style comments plus `///` doc comments (already matched by `//`).
exports.dart = exports.javascript;

// Scala: C-style comments.
exports.scala = exports.javascript;

// JSON with comments / JSON5: C-style.
exports.jsonc = exports.javascript;
exports.json5 = exports.javascript;

// JSX / TSX: same as JS/TS. (Note: comments inside JSX expressions are
// `{/* ... */}`; the braces are plain text, so the JS regex still applies.)
exports.jsx = exports.javascript;
exports.tsx = exports.javascript;

// Vue / Svelte single-file components mix HTML, JS and CSS. We default the
// whole file to JS-style stripping, which is the common case for `<script>`
// blocks; users who want HTML-comment stripping should pass `language: 'html'`.
exports.vue = exports.javascript;
exports.svelte = exports.javascript;

// INI / TOML: `#` and `;` line comments. TOML officially only allows `#`, but
// lots of real-world `.ini` files accept both. Treat identically.
exports.ini = {
  LINE_REGEX: /^[#;].*/
};
exports.toml = {
  LINE_REGEX: /^#.*/
};

// YAML: `#` line comments only.
exports.yaml = {
  LINE_REGEX: /^#.*/
};
exports.yml = exports.yaml;

// Shell / Bash: `#` line comments.
exports.shell = {
  LINE_REGEX: /^#.*/
};
exports.bash = exports.shell;
exports.sh = exports.shell;
exports.zsh = exports.shell;

// PowerShell: `#` line comments and `<# ... #>` block comments.
exports.powershell = {
  BLOCK_OPEN_REGEX: /^<#/,
  BLOCK_CLOSE_REGEX: /^#>/,
  LINE_REGEX: /^#.*/
};
exports.ps1 = exports.powershell;

// Windows Batch: `REM` and `::` line comments. Case-insensitive REM.
exports.batch = {
  LINE_REGEX: /^(?:::|[Rr][Ee][Mm](?=\s|$)).*/
};
exports.bat = exports.batch;
exports.cmd = exports.batch;

// R: `#` line comments.
exports.r = {
  LINE_REGEX: /^#.*/
};

// Elixir: `#` line comments. (ExDoc `@doc """..."""` strings are strings, not
// comments, so we intentionally don't treat them as block comments.)
exports.elixir = {
  LINE_REGEX: /^#.*/
};

// ---- Aliases for existing entries ------------------------------------------

exports.c = exports.javascript;
exports.csharp = exports.javascript;
exports.css = exports.javascript;
exports.java = exports.javascript;
exports.js = exports.javascript;
exports.less = exports.javascript;
exports.pascal = exports.applescript;
exports.ocaml = exports.applescript;
exports.sass = exports.javascript;
exports.scss = exports.javascript;
exports.sql = exports.ada;
exports.swift = exports.javascript;
exports.ts = exports.javascript;
exports.typescript = exports.javascript;
exports.typscript = exports.javascript; // keep historical typo alias
exports.xml = exports.html;
