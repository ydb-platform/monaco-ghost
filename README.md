# monaco-ghost

[![CI](https://github.com/ydb-platform/monaco-ghost/actions/workflows/ci.yml/badge.svg)](https://github.com/ydb-platform/monaco-ghost/actions/workflows/ci.yml)

A lightweight adapter for integrating completion services with Monaco Editor's inline completion system. Provides ghost text suggestions with comprehensive event handling, caching, and React integration.

## Installation

```bash
npm install monaco-ghost monaco-editor
```

## Quick Start

### React Integration

The package provides a React hook and pre-built editor components for easy integration:

```typescript
// Using the pre-built editor component
import { MonacoEditor } from 'monaco-ghost';

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
      onCompletionAccept={(text) => console.log('Accepted:', text)}
      onCompletionDecline={(text, reason, otherSuggestions) =>
        console.log('Declined:', text, reason, otherSuggestions)}
      onCompletionIgnore={(text, otherSuggestions) =>
        console.log('Ignored:', text, otherSuggestions)}
      onCompletionError={(error) => console.error('Error:', error)}
      editorOptions={{
        minimap: { enabled: false },
        fontSize: 14,
      }}
    />
  );
}


// Using the hook directly with your own Monaco instance
import React, { useCallback } from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor';
import { useMonacoGhost } from 'monaco-ghost';

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

  const { registerMonacoGhost, dispose } = useMonacoGhost({
    api: javaApi,
    config: javaConfig,
    onCompletionAccept: (text) => console.log('Accepted:', text),
    onCompletionDecline: (text, reason, otherSuggestions) =>
      console.log('Declined:', text, reason, otherSuggestions),
    onCompletionIgnore: (text, otherSuggestions) =>
      console.log('Ignored:', text, otherSuggestions),
    onCompletionError: (error) => console.error('Error:', error),
  });

  const editorDidMount = useCallback((editor: monaco.editor.IStandaloneCodeEditor) => {
    editor.focus();
    registerMonacoGhost(editor);
  }, [registerMonacoGhost]);

  // Optional: Manual cleanup if needed
  // useEffect(() => () => dispose(), [dispose]);

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

### Vanilla JavaScript

```typescript
import * as monaco from 'monaco-editor';
import { createCodeCompletionService, registerCompletionCommands } from 'monaco-ghost';

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

## Features

### 1. Multi-Language Support

- Language-specific configurations and APIs
- Language is required in config when using hooks
- Each language can have its own completion service
- Built-in support for SQL and Java
- Language switching capabilities with automatic cleanup

### 2. Completion Service Integration

- Extracts code context around cursor
- Formats requests for completion services
- Handles response transformation
- Supports any completion service that implements the API interface
- Case-insensitive completion matching
- Sophisticated position tracking for partial completions
- Automatic word boundary detection

### 3. Ghost Text Display

- Shows suggestions inline as ghost text
- Handles partial and full acceptance
- Supports keyboard navigation
- Manages suggestion lifecycle
- Multiple suggestions support with cycling

### 4. Performance Features

- Request debouncing
- Suggestion caching with hit count tracking
- Position-aware caching with text matching
- Promise-based debouncing with cancellation
- Configurable text limits
- Optimized for large files
- Case-insensitive text matching for better suggestions
- Automatic resource cleanup and memory management

### 5. Event System

- Type-safe event handling
- Tracks completion acceptance with full text
- Monitors completion declines with reason and other available suggestions
- Records ignored suggestions with alternative options
- Error event handling for robust error management
- Comprehensive event data for analytics

### 6. Theme Support

- Dark theme (vs-dark)
- Light theme (vs-light)
- Customizable editor options
- Style customization through props

### 7. Interactive Demo

- Built-in Storybook integration
- Live examples for different languages
- Event logging and visualization
- Theme switching examples
- Customization examples

## Configuration

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

## Keyboard Shortcuts

The following keyboard shortcuts are available:

```typescript
{
  'Tab': 'Accept current suggestion',
  'Escape': 'Decline current suggestion',
  'Alt+]': 'Cycle to next suggestion',
  'Alt+[': 'Cycle to previous suggestion'
}
```

## API Interface

Implement this interface to connect your completion service:

```typescript
interface ICodeCompletionAPI {
  getCodeAssistSuggestions(data: PromptFile[]): Promise<Suggestions>;
}

interface Suggestions {
  Suggests: Suggestion[];
  RequestId: string;
}

interface Suggestion {
  Text: string;
}

interface PromptFile {
  Path: string;
  Fragments: PromptFragment[];
  Cursor: PromptPosition;
}

interface PromptFragment {
  Text: string;
  Start: PromptPosition;
  End: PromptPosition;
}

interface PromptPosition {
  Ln: number;
  Col: number;
}
```

## Events

The completion service emits four types of events with rich data:

1. **Acceptance Events**

   ```typescript
   interface CompletionAcceptEvent {
     requestId: string;
     acceptedText: string;
   }

   completionProvider.events.on('completion:accept', (data: CompletionAcceptEvent) => {
     console.log('Accepted:', data.acceptedText);
   });
   ```

2. **Decline Events**

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

3. **Ignore Events**

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

4. **Error Events**
   ```typescript
   completionProvider.events.on('completion:error', (error: Error) => {
     console.error('Completion error:', error);
   });
   ```

## Development

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

### Output Formats

- **CommonJS**: `dist/cjs/index.js`
- **ES Modules**: `dist/esm/index.js`
- **TypeScript Declarations**: `dist/types/index.d.ts`

### Build Commands

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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

1. **Code Context**

   - Handle text limits appropriately
   - Maintain cursor position accuracy
   - Consider edge cases
   - Support partial text acceptance

2. **Error Handling**

   - Wrap API calls in try-catch blocks
   - Fail gracefully on errors
   - Log issues without breaking editor
   - Emit error events for monitoring

3. **Performance**

   - Use debouncing for API calls
   - Implement efficient caching
   - Track suggestion hit counts
   - Clean up resources properly

4. **Testing**
   - Add tests for new features
   - Maintain backward compatibility
   - Test edge cases
   - Verify event handling

## License

Apache-2.0 - see LICENSE file for details.
