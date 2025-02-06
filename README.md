# @ydb-platform/monaco-ghost

<div align="center">

[![CI](https://github.com/ydb-platform/monaco-ghost/actions/workflows/ci.yml/badge.svg)](https://github.com/ydb-platform/monaco-ghost/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/%40ydb-platform%2Fmonaco-ghost.svg)](https://www.npmjs.com/package/@ydb-platform/monaco-ghost)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

🚀 A lightweight adapter for integrating completion services with Monaco Editor's inline completion system.

[Installation](#-installation) •
[Quick Start](#-quick-start) •
[Documentation](#-documentation) •
[Contributing](#-contributing)

</div>

---

## ✨ Features at a Glance

- 👻 **Ghost Text Display** - Inline suggestions with keyboard navigation
- ⚡ **High Performance** - Debouncing, caching, and optimized for large files
- 🎯 **Type Safety** - Comprehensive TypeScript support
- 🎨 **Theme Support** - Dark and light themes with customization options
- 📊 **Event System** - Rich analytics and error tracking
- 🧩 **React Integration** - Pre-built components and hooks

## 📦 Installation

```bash
npm install @ydb-platform/monaco-ghost monaco-editor
```

## 🚀 Quick Start

### React Integration with Hook

```typescript
import React, { useCallback } from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor';
import { useMonacoGhost } from '@ydb-platform/monaco-ghost';

function MyCustomEditor() {
  // Java-specific API implementation
  const javaApi = {
    getCodeAssistSuggestions: async () => ({
      Suggests: [{ Text: 'System.out.println("Hello, World!");' }],
      RequestId: 'demo-request',
    }),
  };

  // Java-specific configuration
  const javaConfig = {
    debounceTime: 200,
    textLimits: {
      beforeCursor: 8000,
      afterCursor: 1000,
    },
    suggestionCache: {
      enabled: true,
    },
  };

  const eventHandlers = {
    onCompletionAccept: text => console.log('Accepted:', text),
    onCompletionDecline: (text, reason, otherSuggestions) =>
      console.log('Declined:', text, reason, otherSuggestions),
    onCompletionIgnore: (text, otherSuggestions) => console.log('Ignored:', text, otherSuggestions),
    onCompletionError: error => console.error('Error:', error),
  };

  const { registerMonacoGhost, dispose } = useMonacoGhost({
    api: javaApi,
    eventHandlers,
    config: javaConfig,
  });

  const editorDidMount = useCallback(
    (editor: monaco.editor.IStandaloneCodeEditor) => {
      registerMonacoGhost(editor);
    },
    [registerMonacoGhost]
  );

  const options = {
    selectOnLineNumbers: true,
    minimap: { enabled: false },
    automaticLayout: true,
    fontSize: 14,
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    roundedSelection: false,
    padding: { top: 10 },
  };

  return (
    <MonacoEditor
      width="800"
      height="600"
      language="java"
      theme="vs-dark" // or "vs-light"
      value="// Your Java code here"
      options={options}
      editorDidMount={editorDidMount}
    />
  );
}
```

<details>
<summary>Using the pre-built editor component</summary>

```typescript
// Using the pre-built editor component
import { MonacoEditor } from '@ydb-platform/monaco-ghost';

function MyApp() {
  // SQL-specific API implementation
  const sqlApi = {
    getCodeAssistSuggestions: async () => ({
      Suggests: [{ Text: 'SELECT * FROM users;' }],
      RequestId: 'demo-request',
    }),
  };

  // SQL-specific configuration
  const sqlConfig = {
    debounceTime: 200,
    textLimits: {
      beforeCursor: 8000,
      afterCursor: 1000,
    },
    suggestionCache: {
      enabled: true,
    },
  };

  return (
    <MonacoEditor
      initialValue="-- Your SQL code here"
      language="sql"
      theme="vs-dark" // or "vs-light"
      api={sqlApi}
      config={sqlConfig}
      onCompletionAccept={text => console.log('Accepted:', text)}
      onCompletionDecline={(text, reason, otherSuggestions) =>
        console.log('Declined:', text, reason, otherSuggestions)
      }
      onCompletionIgnore={(text, otherSuggestions) =>
        console.log('Ignored:', text, otherSuggestions)
      }
      onCompletionError={error => console.error('Error:', error)}
      editorOptions={{
        minimap: { enabled: false },
        fontSize: 14,
      }}
    />
  );
}
```

</details>

### Vanilla JavaScript

<details>
<summary>View Vanilla JavaScript implementation</summary>

```typescript
import * as monaco from 'monaco-editor';
import {
  createCodeCompletionService,
  registerCompletionCommands,
} from '@ydb-platform/monaco-ghost';

// Create language-specific API implementation
const sqlApi = {
  getCodeAssistSuggestions: async data => {
    // Call your completion service
    // Return suggestions in the expected format
    return {
      Suggests: [{ Text: 'SELECT * FROM users;' }],
      RequestId: 'request-id',
    };
  },
};

// Configure the adapter with language-specific settings
const sqlConfig = {
  debounceTime: 200,
  textLimits: {
    beforeCursor: 8000,
    afterCursor: 1000,
  },
  suggestionCache: {
    enabled: true,
  },
};

// Create provider for SQL
const sqlCompletionProvider = createCodeCompletionService(sqlApi, sqlConfig);

// Subscribe to completion events with type safety
sqlCompletionProvider.events.on('completion:accept', data => {
  console.log('Completion accepted:', data.acceptedText);
});

sqlCompletionProvider.events.on('completion:decline', data => {
  console.log(
    'Completion declined:',
    data.suggestionText,
    'reason:',
    data.reason,
    'other suggestions:',
    data.otherSuggestions
  );
});

sqlCompletionProvider.events.on('completion:ignore', data => {
  console.log(
    'Completion ignored:',
    data.suggestionText,
    'other suggestions:',
    data.otherSuggestions
  );
});

sqlCompletionProvider.events.on('completion:error', error => {
  console.error('Completion error:', error);
});

// Register with Monaco for SQL
monaco.languages.registerInlineCompletionsProvider(['sql'], sqlCompletionProvider);

// Register commands (assuming you have an editor instance)
registerCompletionCommands(monaco, sqlCompletionProvider, editor);
```

</details>

## 📚 Documentation

### 🎮 Keyboard Shortcuts

| Key      | Action                       |
| -------- | ---------------------------- |
| `Tab`    | Accept current suggestion    |
| `Escape` | Decline current suggestion   |
| `Alt+]`  | Cycle to next suggestion     |
| `Alt+[`  | Cycle to previous suggestion |

### ⚙️ Configuration

```typescript
interface CodeCompletionConfig {
  // Required when using hooks
  language?: string; // The language this configuration applies to (e.g., 'sql', 'java')

  // Performance settings
  debounceTime?: number; // Time in ms to debounce API calls (default: 200)

  // Text limits
  textLimits?: {
    beforeCursor?: number; // Characters to include before cursor (default: 8000)
    afterCursor?: number; // Characters to include after cursor (default: 1000)
  };

  // Cache settings
  suggestionCache?: {
    enabled?: boolean; // Whether to enable suggestion caching (default: true)
  };
}
```

### 🔌 API Interface

<details>
<summary>View API Interface details</summary>

```typescript
interface ICodeCompletionAPI {
  getCodeAssistSuggestions(data: PromptFile[]): Promise<Suggestions>;
}

export interface PromptPosition {
  lineNumber: number;
  column: number;
}

export interface PromptFragment {
  text: string;
  start: PromptPosition;
  end: PromptPosition;
}

export interface PromptFile {
  path: string;
  fragments: PromptFragment[];
  cursorPosition: PromptPosition;
}

export interface Suggestions {
  items: string[];
  requestId?: string;
}

```
</details>

### 📊 Events

<details>
<summary>View Events documentation</summary>

The completion service emits four types of events with rich data:

#### 1. Acceptance Events

```typescript
interface CompletionAcceptEvent {
  requestId: string;
  acceptedText: string;
}

completionProvider.events.on('completion:accept', (data: CompletionAcceptEvent) => {
  console.log('Accepted:', data.acceptedText);
});
```

#### 2. Decline Events

```typescript
interface CompletionDeclineEvent {
  requestId: string;
  suggestionText: string;
  reason: string;
  hitCount: number;
  otherSuggestions: string[];
}

completionProvider.events.on('completion:decline', (data: CompletionDeclineEvent) => {
  console.log('Declined:', data.suggestionText, 'reason:', data.reason);
  console.log('Other suggestions:', data.otherSuggestions);
  console.log('Times shown:', data.hitCount);
});
```

#### 3. Ignore Events

```typescript
interface CompletionIgnoreEvent {
  requestId: string;
  suggestionText: string;
  otherSuggestions: string[];
}

completionProvider.events.on('completion:ignore', (data: CompletionIgnoreEvent) => {
  console.log('Ignored:', data.suggestionText);
  console.log('Other suggestions:', data.otherSuggestions);
});
```

#### 4. Error Events

```typescript
completionProvider.events.on('completion:error', (error: Error) => {
  console.error('Completion error:', error);
});
```

</details>

## 🛠️ Development

### Setup

```bash
# Install dependencies
npm install

# Start Storybook for development
npm run storybook

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

### Build System

The package uses a hybrid build system:

- **TypeScript (tsc)** for type checking and declaration files
- **esbuild** for fast, optimized builds

Output Formats:

- **CommonJS**: `dist/cjs/index.js`
- **ES Modules**: `dist/esm/index.js`
- **TypeScript Declarations**: `dist/types/index.d.ts`

<details>
<summary>View Build Commands</summary>

```bash
# Type checking only
npm run type-check

# Build type declarations
npm run build:types

# Build CommonJS version
npm run build:cjs

# Build ES Modules version
npm run build:esm

# Full build (all formats)
npm run build
```

</details>

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

<details>
<summary>View Development Guidelines</summary>

### Development Guidelines

#### 1. Code Context

- Handle text limits appropriately
- Maintain cursor position accuracy
- Consider edge cases
- Support partial text acceptance

#### 2. Error Handling

- Wrap API calls in try-catch blocks
- Fail gracefully on errors
- Log issues without breaking editor
- Emit error events for monitoring

#### 3. Performance

- Use debouncing for API calls
- Implement efficient caching
- Track suggestion hit counts
- Clean up resources properly

#### 4. Testing

- Add tests for new features
- Maintain backward compatibility
- Test edge cases
- Verify event handling
</details>

## 📄 License

Apache-2.0 - see [LICENSE](LICENSE) file for details.
