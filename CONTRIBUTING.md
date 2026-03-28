# Contributing Guide

Thank you for your interest in contributing to irodori!

## Development Setup

```bash
# Clone the repository
git clone https://github.com/seino/irodori.git
cd irodori

# Install dependencies
npm install

# Verify tests pass
npm test
```

**Required:** Node.js 18 or later

## Development Workflow

### 1. Create a branch

```bash
git checkout -b feat/your-feature   # New feature
git checkout -b fix/your-fix        # Bug fix
git checkout -b refactor/your-task  # Refactoring
```

Please avoid committing directly to `main`.

### 2. Make your changes

```bash
npm run dev          # Watch mode build
npm test             # Run tests
npm run typecheck    # Type check
npm run build        # Verify build
```

### 3. Open a pull request

- Write a concise PR title describing the change
- Add tests in `tests/` for new features
- Include JSDoc for all public APIs

## Coding Guidelines

### Key Rules

- **Zero external dependencies** (except devDependencies)
- Ensure fallback behavior when `ColorLevel.None` is active
- Never swallow errors silently — always log or re-throw

### Style

- TypeScript strict mode
- Single quotes, semicolons, 2-space indentation
- Functions should be ~30 lines max, ~3 parameters max

### Commit Messages

```
[type] subject (50 chars or less)

Types: feat / fix / refactor / docs / style / test / chore
```

Example: `[feat] Add border style options to Table widget`

## Testing

```bash
npm test              # Unit tests
npm run test:e2e      # E2E tests (ESM/CJS compatibility)
npm run test:coverage # Tests with coverage
```

- Use snapshot tests where appropriate
- Test fallback behavior in non-TTY environments

## Issues / Bug Reports

- Search existing issues first
- Include reproduction steps and environment info (Node.js version, OS)

## License

All contributions are released under the [MIT License](./LICENSE).
