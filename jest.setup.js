// Add custom jest matchers for testing-library
require('@testing-library/jest-dom');

// Mock monaco-editor
jest.mock('monaco-editor/esm/vs/editor/editor.api', () => ({
  editor: {
    create: jest.fn(),
    createModel: jest.fn(),
    IModelContentChangedEvent: jest.fn(),
  },
  languages: {
    register: jest.fn(),
    registerCompletionItemProvider: jest.fn(),
  },
  Range: jest.fn().mockImplementation((startLine, startCol, endLine, endCol) => ({
    startLineNumber: startLine,
    startColumn: startCol,
    endLineNumber: endLine,
    endColumn: endCol,
  })),
  Position: jest.fn().mockImplementation((line, col) => ({
    lineNumber: line,
    column: col,
  })),
}));
