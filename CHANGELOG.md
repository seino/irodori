# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] - 2026-03-28

### Added

- **Console** — Unified output API with `print()`, `log()`, `rule()`, `printException()`
- **Markup** — Rich text parser supporting `[bold red]text[/]` syntax
- **ANSI** — Auto-detection and conversion for TrueColor / 256-color / Basic / None
- **Table** — Auto column sizing, full-width Unicode support, multiple border styles
- **Panel** — Bordered content box with title and subtitle support
- **Rule** — Horizontal rule widget
- **Progress** — Multi-task progress bars with ETA and customizable columns
- **Status / Spinner** — Indeterminate operation display with multiple spinner styles
- **Live** — Cursor-based efficient differential rendering
- **Emoji** — `:emoji_name:` shorthand insertion
- **Layout** — Text measurement and formatting with `stringWidth()`, `wrapText()`, `truncateText()`
- **Environment detection** — Auto-detection of TTY, CI, and color level with fallback
- ESM / CJS dual build support
- TypeScript type definitions included
- Zero external dependencies

[0.1.0]: https://github.com/seino/irodori/releases/tag/v0.1.0
