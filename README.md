# monaco-ghost

A lightweight adapter for integrating completion services with Monaco Editor's inline completion system. Provides ghost text suggestions with telemetry tracking and caching.

## Installation

```bash
npm install monaco-ghost monaco-editor
```

## Quick Start

```typescript
import * as monaco from 'monaco-editor';
import {createCompletionProvider, registerCompletionCommands} from 'monaco-ghost';

// Create API implementation for your completion service
const api = {
  getCodeAssistSuggestions: async (data) => {
    // Call your completion service
    // Return suggestions in the expected format
    return {
      Suggests: [{Text: 'suggestion'}],
      RequestId: 'request-id',
    };
  },
  sendCodeAssistTelemetry: async (data) => {
    // Optional: implement telemetry tracking
  },
};

// Configure the adapter
const config = {
  debounceTime: 200,
  textLimits: {
    beforeCursor: 8000,
    afterCursor: 1000,
  },
  telemetry: {
    enabled: true,
  },
  suggestionCache: {
    enabled: true,
  },
};

// Create provider
const completionProvider = createCompletionProvider(api, config);

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

### 4. Telemetry Support

- Tracks acceptance rates
- Measures response times
- Records user interactions
- Optional and configurable

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

  // Telemetry settings
  telemetry?: {
    enabled?: boolean; // Whether to enable telemetry (default: true)
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
  sendCodeAssistTelemetry(data: TelemetryEvent): Promise<unknown>;
}

interface Suggestions {
  Suggests: Suggestion[];
  RequestId: string;
}

interface Suggestion {
  Text: string;
}
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

## Telemetry Events

Three types of events are tracked:

1. **Acceptance Events**

   ```typescript
   interface AcceptSuggestionEvent {
     Accepted: {
       RequestId: string;
       Timestamp: number;
       AcceptedText: string;
       ConvertedText: string;
     };
   }
   ```

2. **Discard Events**

   ```typescript
   interface DiscardSuggestionEvent {
     Discarded: {
       RequestId: string;
       Timestamp: number;
       DiscardReason: 'OnCancel';
       DiscardedText: string;
       CacheHitCount: number;
     };
   }
   ```

3. **Ignore Events**
   ```typescript
   interface IgnoreSuggestionEvent {
     Ignored: {
       RequestId: string;
       Timestamp: number;
       IgnoredText: string;
     };
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
