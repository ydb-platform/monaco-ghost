# monaco-ghost

[![CI](https://github.com/ydb-platform/monaco-ghost/actions/workflows/ci.yml/badge.svg)](https://github.com/ydb-platform/monaco-ghost/actions/workflows/ci.yml)

A lightweight adapter for integrating completion services with Monaco Editor's inline completion system. Provides ghost text suggestions with event system and caching.

## Installation

```bash
npm install monaco-ghost monaco-editor react-monaco-editor(optionally)
```

## Quick Start

### React Integration

The package provides a React hook and a pre-built editor component for easy integration:

```typescript
// Using the pre-built editor component
import { MonacoEditor } from 'monaco-ghost';

function MyApp() {
  const api = {
    getCodeAssistSuggestions: async () => ({
      Suggests: [{ Text: 'suggestion' }],
      RequestId: 'demo-request',
    }),
  };

  const config = {
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
      initialValue="// Your code here"
      language="typescript"
      theme="vs-dark"
      api={api}
      config={config}
      onCompletionAccept={(text) => console.log('Accepted:', text)}
      onCompletionDecline={(text, reason) => console.log('Declined:', text, reason)}
      onCompletionIgnore={(text) => console.log('Ignored:', text)}
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
  const api = {
    getCodeAssistSuggestions: async () => ({
      Suggests: [{ Text: 'suggestion' }],
      RequestId: 'demo-request',
    }),
  };

  const config = {
    debounceTime: 200,
    textLimits: {
      beforeCursor: 8000,
      afterCursor: 1000,
    },
    suggestionCache: {
      enabled: true,
    },
  };

  const { registerMonacoGhost } = useMonacoGhost({
    api,
    config,
    onCompletionAccept: (text) => console.log('Accepted:', text),
    onCompletionDecline: (text, reason) => console.log('Declined:', text, reason),
    onCompletionIgnore: (text) => console.log('Ignored:', text),
  });

  const editorDidMount = useCallback((editor: monaco.editor.IStandaloneCodeEditor) => {
    editor.focus();
    registerMonacoGhost(editor);
  }, [registerMonacoGhost]);

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
      language="typescript"
      theme="vs-dark"
      value="// Your code here"
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

// Create API implementation for your completion service
const api = {
  getCodeAssistSuggestions: async data => {
    // Call your completion service
    // Return suggestions in the expected format
    return {
      Suggests: [{ Text: 'suggestion' }],
      RequestId: 'request-id',
    };
  },
};

// Configure the adapter
const config = {
  debounceTime: 200,
  textLimits: {
    beforeCursor: 8000,
    afterCursor: 1000,
  },
  suggestionCache: {
    enabled: true,
  },
};

// Create provider
const completionProvider = createCodeCompletionService(api, config);

// Subscribe to completion events
completionProvider.events.on('completion:accept', data => {
  console.log('Completion accepted:', data.acceptedText);
});

completionProvider.events.on('completion:decline', data => {
  console.log('Completion declined:', data.suggestionText, 'reason:', data.reason);
});

completionProvider.events.on('completion:ignore', data => {
  console.log('Completion ignored:', data.suggestionText);
});

// Register with Monaco
monaco.languages.registerInlineCompletionsProvider(['yql'], completionProvider);

// Register commands (assuming you have an editor instance)
registerCompletionCommands(monaco, completionProvider, editor);
```

## Build System

The package uses a hybrid build system:

- **TypeScript (tsc)** for type checking and declaration files
- **esbuild** for fast, optimized builds

### Output Formats

- **CommonJS**: `dist/cjs/index.js`
- **ES Modules**: `dist/esm/index.js`
- **TypeScript Declarations**: `dist/types/index.d.ts`

### Build Commands

```bash
# Install dependencies
npm install

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

## Features

### 1. Completion Service Integration

- Extracts code context around cursor
- Formats requests for completion services
- Handles response transformation
- Supports any completion service that implements the API interface

### 2. Ghost Text Display

- Shows suggestions inline as ghost text
- Handles partial and full acceptance
- Supports keyboard navigation
- Manages suggestion lifecycle

### 3. Performance Features

- Request debouncing
- Suggestion caching
- Configurable text limits
- Optimized for large files

### 4. Event System

- Tracks completion acceptance
- Monitors completion declines
- Records ignored suggestions
- Fully customizable event handling

## Configuration

```typescript
interface CodeCompletionConfig {
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
```

## Events

The completion service emits three types of events:

1. **Acceptance Events**

   ```typescript
   completionProvider.events.on('completion:accept', data => {
     // data: {
     //   requestId: string;
     //   acceptedText: string;
     // }
   });
   ```

2. **Decline Events**

   ```typescript
   completionProvider.events.on('completion:decline', data => {
     // data: {
     //   requestId: string;
     //   suggestionText: string;
     //   reason: string;
     //   hitCount: number;
     // }
   });
   ```

3. **Ignore Events**
   ```typescript
   completionProvider.events.on('completion:ignore', data => {
     // data: {
     //   requestId: string;
     //   suggestionText: string;
     // }
   });
   ```

## Request Format

The adapter formats code context in this structure:

```typescript
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

2. **Error Handling**

   - Wrap API calls in try-catch blocks
   - Fail gracefully on errors
   - Log issues without breaking editor

3. **Performance**

   - Use debouncing for API calls
   - Implement efficient caching
   - Clean up resources properly

4. **Testing**
   - Add tests for new features
   - Maintain backward compatibility
   - Test edge cases

## License

Apache-2.0 - see LICENSE file for details.
