# Contributing to monaco-ghost

Thank you for your interest in contributing to monaco-ghost! This document provides guidelines and instructions for contributing to the project.

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- Git

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/monaco-ghost.git
   cd monaco-ghost
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start Storybook for development:
   ```bash
   npm run storybook
   ```

## 💻 Development Workflow

1. Create a new branch for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
   or
   ```bash
   git checkout -b fix/your-fix-name
   ```

2. Make your changes following our coding standards
3. Test your changes thoroughly
4. Commit your changes with clear, descriptive messages
5. Push to your fork and submit a pull request

## 📝 Coding Standards

### TypeScript Guidelines

- Use TypeScript for all new code
- Maintain strict type safety
- Avoid using `any` type
- Document complex types with JSDoc comments

### Code Style

- Use ESLint and Prettier for code formatting
- Follow existing code patterns and structure
- Keep functions small and focused
- Use meaningful variable and function names
- Add comments for complex logic

### Testing Requirements

- Write unit tests for new features
- Maintain or improve code coverage
- Test edge cases thoroughly
- Include integration tests when needed

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- path/to/test/file.test.ts
```

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for public APIs
- Document complex algorithms
- Include usage examples in comments
- Keep documentation up-to-date with code changes

### README Updates

- Update README.md for new features
- Add examples for new functionality
- Document breaking changes
- Keep the API documentation current

## 🔄 Pull Request Process

1. **Before Submitting**
   - Ensure all tests pass
   - Update documentation if needed
   - Add tests for new features
   - Check code coverage

2. **PR Description**
   - Clearly describe the changes
   - Link related issues
   - List breaking changes
   - Include screenshots for UI changes

3. **Review Process**
   - Address review comments
   - Keep the PR focused and small
   - Rebase if needed
   - Be responsive to feedback

## 🐛 Bug Reports

When filing a bug report, please include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Code examples if applicable
- Environment details

## 🎯 Feature Requests

When proposing new features:

- Describe the problem you're solving
- Explain your proposed solution
- Include example use cases
- Consider edge cases

## 🏗️ Project Structure

```
monaco-ghost/
├── src/                    # Source code
│   ├── components/        # React components
│   ├── hooks/            # React hooks
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
├── tests/                 # Test files
├── stories/              # Storybook stories
└── docs/                 # Documentation
```

## 🔨 Build System

The project uses a hybrid build system:

- **TypeScript (tsc)** for type checking and declaration files
- **esbuild** for fast, optimized builds

### Build Commands

```bash
# Type checking
npm run type-check

# Build type declarations
npm run build:types

# Build CommonJS version
npm run build:cjs

# Build ES Modules version
npm run build:esm

# Full build
npm run build
```

## 📊 Performance Considerations

- Use debouncing for API calls
- Implement efficient caching
- Clean up resources properly
- Consider memory usage
- Profile performance impacts

## 🔐 Security Guidelines

- Review dependencies regularly
- Follow security best practices
- Report security issues privately
- Use secure API endpoints
- Validate user inputs

## 📜 License

By contributing, you agree that your contributions will be licensed under the Apache-2.0 License.